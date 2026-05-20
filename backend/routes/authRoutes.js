import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, resetPasswordWithAnswer } from "../controllers/authController.js";

const router = express.Router();


// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.put("/reset-password/:token", resetPassword);

// Reset with Security Answer
router.post("/reset-password-answer", resetPasswordWithAnswer);

export default router;