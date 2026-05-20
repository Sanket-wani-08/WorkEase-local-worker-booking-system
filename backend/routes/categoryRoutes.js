import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC: Get all categories 
router.get("/", getCategories);

// ADMIN: Create a new category
router.post("/", protect, authorize("admin"), createCategory);

// ADMIN: Update a category
router.put("/:id", protect, authorize("admin"), updateCategory);

// ADMIN: Delete a category
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
