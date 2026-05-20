import Worker from "../models/Worker.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import Category from "../models/Category.js";
import crypto from "crypto";
import Booking from "../models/Booking.js";


// register worker
export const registerWorker = async (req, res) => {
    try {

        const {
            name,
            phone,
            category,
            subcategory,
            experience,
            aadhaarNumber,
            password,
            securityQuestion,
            securityAnswer
        } = req.body;

        if (!name || !phone || !category || !subcategory || !aadhaarNumber || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (phone.length !== 10) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        if (aadhaarNumber.length !== 12) {
            return res.status(400).json({ message: "Invalid Aadhaar number" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (!req.files?.aadhaarImage) {
            return res.status(400).json({ message: "Aadhaar image is required" });
        }

        const existing = await Worker.findOne({ phone });
        if (existing) {
            return res.status(400).json({ message: "Worker already exists" });
        }

        // validate category & subcategory against DB
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ message: "Invalid category" });
        }
        if (!categoryDoc.subcategories.includes(subcategory)) {
            return res.status(400).json({ message: "Invalid subcategory for the selected category" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // upload images to cloudinary
        let profileImage = "";
        let aadhaarImage = "";

        if (req.files?.profileImage) {
            const result = await cloudinary.uploader.upload(
                req.files.profileImage[0].path
            );
            profileImage = result.secure_url;
            fs.unlinkSync(req.files.profileImage[0].path);
        }

        if (req.files?.aadhaarImage) {
            const result = await cloudinary.uploader.upload(
                req.files.aadhaarImage[0].path
            );
            aadhaarImage = result.secure_url;
            fs.unlinkSync(req.files.aadhaarImage[0].path);
        }

        const worker = await Worker.create({
            name,
            phone,
            category,
            subcategory,
            experience,
            aadhaarNumber,
            password: hashedPassword,
            profileImage,
            aadhaarImage,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase(),
            verificationStatus: "Pending",
            isVerified: false,
            rejectionReason: "",
            location: {
                type: "Point",
                coordinates: [0, 0]
            }
        });

        res.status(201).json({
            message: "Worker registered successfully",
            worker: {
                id: worker._id,
                name: worker.name,
                phone: worker.phone,
                category: worker.category,
                subcategory: worker.subcategory,
                profileImage,
                aadhaarImage,
                verificationStatus: worker.verificationStatus
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login
export const loginWorker = async (req, res) => {
    try {

        const { phone, password } = req.body;

        const worker = await Worker.findOne({ phone }).select("+password");

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        const isMatch = await bcrypt.compare(password, worker.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (worker.verificationStatus === "Rejected") {
            return res.status(403).json({ 
                message: `Account Rejected: ${worker.rejectionReason || "Please contact admin"}` 
            });
        }

        if (!worker.isVerified) {
            return res.status(403).json({ message: "Account not approved yet" });
        }

        const token = jwt.sign(
            { id: worker._id, role: "worker" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            worker: {
                id: worker._id,
                name: worker.name,
                phone: worker.phone,
                category: worker.category,
                subcategory: worker.subcategory
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get worker profile
export const getWorkerProfile = async (req, res) => {
    try {

        const worker = await Worker.findById(req.user.id);

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.json(worker);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// update worker profile
export const updateWorkerProfile = async (req, res) => {
    try {

        const worker = await Worker.findById(req.user.id);

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        const { name, category, subcategory, experience } = req.body;
 
        if (name) worker.name = name;
        if (category) worker.category = category;
        if (subcategory) worker.subcategory = subcategory;
        if (experience !== undefined) worker.experience = experience;

        // update profile image if provided
        if (req.files?.profileImage) {
            const result = await cloudinary.uploader.upload(
                req.files.profileImage[0].path
            );

            worker.profileImage = result.secure_url;
            fs.unlinkSync(req.files.profileImage[0].path);
        }

        await worker.save();

        res.json({
            message: "Profile updated successfully",
            worker
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get all verified workers
export const getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({ isVerified: true });
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// search workers by category/subcategory
export const searchWorkers = async (req, res) => {
    try {

        const { category, subcategory } = req.query;

        let query = { isVerified: true };

        if (category) query.category = new RegExp(category, "i");
        if (subcategory) query.subcategory = new RegExp(subcategory, "i");

        const workers = await Worker.find(query);

        res.json(workers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// nearby workers (geo query)
export const getNearbyWorkers = async (req, res) => {
    try {

        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude & Longitude required" });
        }

        const workers = await Worker.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 5000
                }
            }
        });

        res.json(workers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// update location
export const updateLocation = async (req, res) => {
    try {

        const { lat, lng } = req.body;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ message: "Latitude & Longitude required" });
        }

        const worker = await Worker.findByIdAndUpdate(
            req.user.id,
            {
                location: {
                    type: "Point",
                    coordinates: [lng, lat]
                }
            },
            { new: true }
        );

        res.json({
            message: "Location updated",
            worker
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get pending workers (admin)
export const getPendingWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({ verificationStatus: "Pending" });
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// verify worker (admin)
export const verifyWorker = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true,
                verificationStatus: "Approved",
                rejectionReason: ""
            },
            { new: true }
        );

        res.json({ message: "Worker approved", worker });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// reject worker (admin)
export const rejectWorker = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const { reason } = req.body;

        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: false,
                verificationStatus: "Rejected",
                rejectionReason: reason || "Not specified"
            },
            { new: true }
        );

        res.json({ message: "Worker rejected", worker });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// forgot password - get security question
export const forgotPasswordWorker = async (req, res) => {
    try {
        const { phone } = req.body;
        const worker = await Worker.findOne({ phone });

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.json({ 
            message: "Security question found", 
            question: worker.securityQuestion 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// reset pass with security answer
export const resetPasswordWithAnswerWorker = async (req, res) => {
    try {
        const { phone, answer, newPassword } = req.body;
        const worker = await Worker.findOne({ phone }).select("+securityAnswer");
        
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        if (worker.securityAnswer !== answer.toLowerCase()) {
            return res.status(400).json({ message: "Incorrect security answer" });
        }

        worker.password = await bcrypt.hash(newPassword, 10);
        await worker.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// reset password (token based)
export const resetPasswordWorker = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const worker = await Worker.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!worker) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        worker.password = await bcrypt.hash(password, 10);
        worker.resetPasswordToken = undefined;
        worker.resetPasswordExpire = undefined;

        await worker.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get worker stats
export const getWorkerStats = async (req, res) => {
    try {
        const workerId = req.user.id;
        
        const bookings = await Booking.find({ worker: workerId });
        const worker = await Worker.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === "Completed").length;
        const pendingBookings = bookings.filter(b => b.status === "Pending" || b.status === "Accepted").length;
        
        // earnings after 15% platform fee
        const totalEarnings = bookings
            .filter(b => b.status === "Completed" && b.paymentStatus === "PAID")
            .reduce((acc, b) => acc + (b.workerEarnings || (b.amount * 0.85)), 0);

        res.json({
            totalBookings,
            completedBookings,
            pendingBookings,
            totalEarnings: Math.round(totalEarnings),
            rating: worker.rating || 0,
            totalReviews: worker.totalReviews || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};