import express from "express";
import {
    addReview,
    getWorkerReviews
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


//  ADD REVIEW
router.post("/", protect, addReview);


// GET WORKER REVIEWS
router.get("/worker/:workerId", getWorkerReviews);


export default router;