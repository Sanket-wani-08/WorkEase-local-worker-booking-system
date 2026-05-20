import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Worker from "../models/Worker.js";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import "dotenv/config";


// get razorpay key
export const getRazorpayKey = async (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};


// create booking (COD + Online)
export const createBooking = async (req, res) => {
    try {

        const {
            service,
            bookingDate,
            address,
            phone,
            paymentMethod,
            amount,
            userLocation,
            category
        } = req.body;

        if (!service || !bookingDate || !address || !phone || !paymentMethod || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (phone.length !== 10) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        const COMMISSION_RATE = 0.15;
        const platformFee = Math.round(amount * COMMISSION_RATE);
        const workerEarnings = amount - platformFee;

        // COD flow
        if (paymentMethod === "COD") {

            const bookingData = {
                user: req.user.id,
                service,
                bookingDate,
                address,
                phone,
                paymentMethod,
                amount,
                platformFee,
                workerEarnings,
                paymentStatus: "PENDING",
                userLocation: userLocation || { type: "Point", coordinates: [72.5714, 23.0225] },
                isBroadcast: true,
                category: category || service
            };

            const booking = await Booking.create(bookingData);

            // notify available workers in this category
            const searchCategory = category || service;
            const workers = await Worker.find({ 
                $or: [
                    { category: searchCategory },
                    { subcategory: service }
                ],
                isAvailable: true 
            });
            
            for (const w of workers) {
                await Notification.create({
                    user: w._id,
                    message: `New broadcast request for ${service}.`
                });
            }

            return res.status(201).json({
                message: "Broadcast request sent to all available workers",
                booking
            });
        }

        // online payment flow
        if (paymentMethod === "ONLINE") {

            const bookingData = {
                user: req.user.id,
                service,
                bookingDate,
                address,
                phone,
                paymentMethod,
                amount,
                platformFee,
                workerEarnings,
                paymentStatus: "PENDING",
                userLocation: userLocation || { type: "Point", coordinates: [72.5714, 23.0225] },
                isBroadcast: true,
                category: category || service
            };

            const booking = await Booking.create(bookingData);

            // create razorpay order
            const options = {
                amount: amount * 100,
                currency: "INR",
                receipt: `receipt_${booking._id}`
            };

            const order = await razorpay.orders.create(options);

            booking.razorpayOrderId = order.id;
            await booking.save();

            // notify workers matching category or subcategory
            const searchCategory = category || service;
            const workers = await Worker.find({ 
                $or: [
                    { category: searchCategory },
                    { subcategory: service }
                ],
                isAvailable: true 
            });
            
            for (const w of workers) {
                await Notification.create({
                    user: w._id,
                    message: `New broadcast request for ${service}.`
                });
            }

            return res.status(200).json({
                message: "Order created successfully",
                order,
                bookingId: booking._id
            });
        }

        return res.status(400).json({ message: "Invalid payment method" });

    } catch (error) {
        console.error("Booking Error:", error);
        const errorMessage = error.error?.description || error.message || "Something went wrong during booking.";
        res.status(500).json({ message: errorMessage });
    }
};



// verify payment
export const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.paymentStatus === "PAID") {
            return res.status(400).json({ message: "Already paid" });
        }

        if (booking.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: "Order mismatch" });
        }

        // signature verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            booking.paymentStatus = "PAID";
            booking.razorpayPaymentId = razorpay_payment_id;

            await booking.save();

            return res.json({
                message: "Payment successful",
                booking
            });

        } else {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// get user bookings
export const getUserBookings = async (req, res) => {
    try {

        const bookings = await Booking.find({ user: req.user.id })
            .populate("worker")
            .sort({ createdAt: -1 });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// get worker bookings (assigned + matching broadcasts)
export const getWorkerBookings = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user.id);
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const bookings = await Booking.find({
            $or: [
                { worker: req.user.id },
                {
                    isBroadcast: true,
                    status: "Pending",
                    $or: [
                        { category: worker.category },
                        { service: worker.subcategory }
                    ]
                }
            ]
        })
        .populate("user")
        .sort({ createdAt: -1 });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get available broadcasts for a worker
export const getAvailableBroadcasts = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user.id);
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const broadcasts = await Booking.find({
            isBroadcast: true,
            status: "Pending",
            worker: null,
            $or: [
                { category: worker.category },
                { service: worker.subcategory }
            ]
        })
        .populate("user", "name location")
        .sort({ createdAt: -1 });

        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// get all bookings (admin)
export const getAllBookings = async (req, res) => {
    try {

        const bookings = await Booking.find()
            .populate("user")
            .populate("worker")
            .sort({ createdAt: -1 });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// update booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ["Pending", "Accepted", "Completed", "Cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // broadcast acceptance
        if (booking.isBroadcast && status === "Accepted") {

            if (booking.worker) {
                return res.status(400).json({ message: "This request has already been accepted by another worker" });
            }

            booking.worker = req.user.id;
            booking.isBroadcast = false;
            booking.status = "Accepted";
            await booking.save();

            const worker = await Worker.findById(req.user.id);
            if (worker) {
                await Notification.create({
                    user: booking.user,
                    message: `${worker.name} has accepted your ${booking.service} request!`,
                    type: "BOOKING_ACCEPTED",
                    booking: booking._id
                });
            }

            return res.json({
                message: "Broadcast request accepted successfully!",
                booking
            });
        }

        // only assigned worker can update status
        if (!booking.worker || booking.worker.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this booking" });
        }

        booking.status = status;
        await booking.save();

        // notify user if cancelled by worker
        if (status === "Cancelled") {
            await Notification.create({
                user: booking.user,
                message: `Your booking for ${booking.service} has been cancelled by the worker. Please book another expert.`,
                type: "BOOKING_CANCELLED",
                booking: booking._id
            });
        }

        res.json({
            message: "Booking status updated",
            booking
        });

    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ message: error.message });
    }
};




// update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (!booking.worker || booking.worker.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update payment" });
        }

        booking.paymentStatus = paymentStatus;
        await booking.save();

        res.json({
            message: `Payment marked as ${paymentStatus}`,
            booking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// cancel booking (user)
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }
        if (booking.status === "Completed") {
            return res.status(400).json({ message: "Cannot cancel a completed booking" });
        }

        booking.status = "Cancelled";
        await booking.save();

        res.json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete booking
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }
        await booking.deleteOne();
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get single booking by id
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user", "name email phone")
            .populate("worker", "name email phone profileImage location");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // only the user or worker of this booking can view it
        const isUser = booking.user._id.toString() === req.user.id;
        const isWorker = booking.worker && booking.worker._id.toString() === req.user.id;

        if (!isUser && !isWorker) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};