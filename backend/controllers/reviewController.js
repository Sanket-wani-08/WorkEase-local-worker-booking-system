import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Worker from "../models/Worker.js";


// add review for a completed booking
export const addReview = async (req, res) => {
    try {

        const { worker, rating, comment, bookingId } = req.body;

        if (!worker || !rating || !bookingId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(worker) || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid IDs" });
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (booking.worker.toString() !== worker) {
            return res.status(400).json({
                message: "Worker does not match booking"
            });
        }

        if (booking.status !== "Completed") {
            return res.status(400).json({
                message: "Review allowed only after completion"
            });
        }

        // check if already reviewed
        const alreadyReviewed = await Review.findOne({ booking: bookingId });

        if (alreadyReviewed) {
            return res.status(400).json({
                message: "Review already submitted"
            });
        }

        const review = await Review.create({
            user: req.user.id,
            worker,
            rating: numericRating,
            comment,
            booking: bookingId
        });

        // recalculate worker's avg rating
        const stats = await Review.aggregate([
            { $match: { worker: new mongoose.Types.ObjectId(worker) } },
            {
                $group: {
                    _id: "$worker",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        await Worker.findByIdAndUpdate(worker, {
            rating: stats[0]?.avgRating || 0,
            totalReviews: stats[0]?.totalReviews || 0
        });
        
        await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

        res.status(201).json({
            message: "Review added successfully",
            review: {
                id: review._id,
                rating: review.rating,
                comment: review.comment
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get reviews for a worker
export const getWorkerReviews = async (req, res) => {
    try {

        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({ message: "Invalid worker ID" });
        }

        const reviews = await Review.find({ worker: workerId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.json(reviews);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};