import express from "express";
import {
    createBooking,
    verifyPayment,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    updatePaymentStatus,
    deleteBooking,
    getWorkerBookings,
    getRazorpayKey,
    getBookingById,
    getAvailableBroadcasts,
    cancelBooking
} from "../controllers/bookingController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();


// GET RAZORPAY KEY
router.get("/razorpay-key", protect, getRazorpayKey);


//CREATE BOOKING
router.post("/", protect, authorize("user"), createBooking);


//VERIFY PAYMENT
router.post("/verify-payment", protect, verifyPayment);


// USER BOOKINGS
router.get("/my-bookings", protect, getUserBookings);


// WORKER BOOKINGS
router.get("/worker-bookings", protect, authorize("worker"), getWorkerBookings);

// WORKER: AVAILABLE BROADCASTS
router.get("/available-broadcasts", protect, authorize("worker"), getAvailableBroadcasts);


//ADMIN: ALL BOOKINGS 
router.get("/all", protect, authorize("admin"), getAllBookings);


//WORKER: UPDATE STATUS 
router.put("/:id/status", protect, authorize("worker"), updateBookingStatus);


//WORKER: UPDATE PAYMENT STATUS
router.put("/:id/payment", protect, authorize("worker"), updatePaymentStatus);


// GET SINGLE BOOKING (FOR TRACKING/DETAILS)
router.get("/:id", protect, getBookingById);


//USER: CANCEL BOOKING
router.put("/:id/cancel", protect, authorize("user"), cancelBooking);


//USER: DELETE BOOKING
router.delete("/:id", protect, deleteBooking);


export default router;