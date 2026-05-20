import Category from "../models/Category.js";

// default categories to seed on first run
const SEED_CATEGORIES = [
  {
    name: "Home Services",
    subcategories: [
      "Electrician",
      "Plumber",
      "AC Service",
      "Carpenter",
      "Gas Repair",
      "Sewage Cleaning",
      "Deep Cleaning",
      "Pest Control",
    ],
  },
  {
    name: "Household Work",
    subcategories: [
      "Maid Service",
      "Cooking Help",
      "Laundry / Ironing",
      "General House Cleaning",
    ],
  },
  {
    name: "Pick & Drop Services",
    subcategories: [
      "Parcel Delivery",
      "Grocery Pickup",
      "Document Delivery",
      "Emergency Item Pickup",
    ],
  },
  {
    name: "Personal Assistance",
    subcategories: [
      "Driver (with user's car)",
      "Elder Care Support",
      "Helper for Small Tasks",
      "Home Visit Assistance",
    ],
  },
  {
    name: "Roadside Assistance",
    subcategories: [
      "Tyre Puncture Repair",
      "Battery Jump Start",
      "Minor Car Breakdown Help",
      "Emergency Fuel Support",
    ],
  },
  {
    name: "Home Appliances Repair",
    subcategories: [
      "Washing Machine Repair",
      "Refrigerator Repair",
      "TV Repair",
      "Microwave Repair",
      "Water Purifier Repair",
      "Geyser Repair",
    ],
  },
];

// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.status(200).json(categories);
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// seed categories if DB is empty (called on server start)
export const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(SEED_CATEGORIES);
      console.log("Categories seeded successfully");
    }
  } catch (error) {
    console.error("Category seed error:", error);
  }
};

// create category (admin)
export const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name || !subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
      return res.status(400).json({ message: "Name and subcategories array are required" });
    }
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const category = await Category.create({ name, subcategories });
    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ message: "Error creating category" });
  }
};

// update category (admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, subcategories },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated", category });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ message: "Error updating category" });
  }
};

// delete category (admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ message: "Error deleting category" });
  }
};
