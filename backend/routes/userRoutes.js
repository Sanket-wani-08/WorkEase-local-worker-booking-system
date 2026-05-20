import express from "express";
import {
    getUserProfile,
    updateUserProfile
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();


// user profile
router.get("/me", protect, getUserProfile);

// Update profile
router.put("/me", protect, upload.single("profileImage"), updateUserProfile);


export default router;