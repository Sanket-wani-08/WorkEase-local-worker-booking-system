import Notification from "../models/Notification.js";


// get user notifications (paginated)
export const getNotifications = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({
            user: req.user.id
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json(notifications);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// mark single notification as read
export const markAsRead = async (req, res) => {
    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {

        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.json({
            message: "All notifications marked as read"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};