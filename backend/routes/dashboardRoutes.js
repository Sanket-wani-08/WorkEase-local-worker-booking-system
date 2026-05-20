import express from "express";
import {
    getDashboardStats,
    getAdvancedStats
} from "../controllers/dashboardController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();


//DASHBOARD ROUTES (ADMIN ONLY)

// Basic stats
router.get("/stats", protect, authorize("admin"), getDashboardStats);

// Advanced analytics
router.get("/advanced", protect, authorize("admin"), getAdvancedStats);


export default router;