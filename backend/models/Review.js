import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true,
        index: true
    },

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true 
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        trim: true,
        maxlength: 300
    }

}, { timestamps: true });


reviewSchema.index({ worker: 1, createdAt: -1 });


const Review = mongoose.model("Review", reviewSchema);

export default Review;