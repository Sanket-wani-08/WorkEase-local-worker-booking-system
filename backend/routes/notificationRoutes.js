import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// GET NOTIFICATIONS
router.get("/", protect, getNotifications);


// UNREAD COUNT 
router.get("/unread-count", protect, getUnreadCount);


// MARK SINGLE AS READ
router.put("/:id/read", protect, markAsRead);


//MARK ALL AS READ
router.put("/read-all", protect, markAllAsRead);


export default router;