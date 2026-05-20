import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        enum: [
            "BOOKING_CREATED",
            "BOOKING_ACCEPTED",
            "BOOKING_CANCELLED",
            "BOOKING_COMPLETED",
            "PAYMENT_SUCCESS",
            "GENERAL"
        ],
        default: "GENERAL"
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }

}, { timestamps: true });



notificationSchema.index({ user: 1, createdAt: -1 });


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;