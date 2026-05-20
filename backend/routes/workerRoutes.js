import express from "express";
import {
    registerWorker,
    loginWorker,
    searchWorkers,
    getWorkerProfile,
    updateWorkerProfile,
    verifyWorker,
    rejectWorker,
    getPendingWorkers,
    forgotPasswordWorker,
    resetPasswordWorker,
    resetPasswordWithAnswerWorker,
    getWorkerStats
} from "../controllers/workerController.js";

import upload from "../middleware/upload.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();


//  REGISTER WORKER
router.post(
    "/register",
    upload.fields([
        { name: "aadhaarImage", maxCount: 1 },
        { name: "profileImage", maxCount: 1 }
    ]),
    registerWorker
);


//  LOGIN WORKER
router.post("/login", loginWorker);
router.post("/forgot-password", forgotPasswordWorker);
router.put("/reset-password/:token", resetPasswordWorker);
router.post("/reset-password-answer", resetPasswordWithAnswerWorker);
router.get("/search", searchWorkers);



// WORKER PROFILE
router.get("/me", protect, authorize("worker"), getWorkerProfile);


//  UPDATE PROFILE 
router.put(
    "/me",
    protect,
    authorize("worker"),
    upload.fields([
        { name: "profileImage", maxCount: 1 }
    ]),
    updateWorkerProfile
);



router.get("/stats", protect, authorize("worker"), getWorkerStats);


// ADMIN: PENDING
router.get("/pending", protect, authorize("admin"), getPendingWorkers);


// ADMIN: VERIFY 
router.put("/verify/:id", protect, authorize("admin"), verifyWorker);


// ADMIN: REJECT
router.put("/reject/:id", protect, authorize("admin"), rejectWorker);


export default router;