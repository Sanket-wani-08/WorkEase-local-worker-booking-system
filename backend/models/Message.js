import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ["User", "Worker"]
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// Use for fast retrieval 
messageSchema.index({ bookingId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
