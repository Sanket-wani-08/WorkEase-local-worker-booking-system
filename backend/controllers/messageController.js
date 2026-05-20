import Message from "../models/Message.js";

// get messages for a booking
export const getMessagesByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const messages = await Message.find({ bookingId })
            .sort({ createdAt: 1 })
            .lean();
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// save message
export const saveMessage = async (bookingId, sender, senderModel, content) => {
    try {
        const message = await Message.create({
            bookingId,
            sender,
            senderModel,
            content
        });
        return message;
    } catch (error) {
        console.error("Error saving message:", error);
        return null;
    }
};
