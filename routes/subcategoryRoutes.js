const express = require("express");
const router = express.Router();
const SubCategory = require("../models/subcategory");
const Category = require("../models/category");

// Add SubCategory
router.post("/addSubCategory", async (req, res) => {
  const { subCategory, category } = req.body;
  try {
    const catDoc = await Category.findOne({ category }); // `category` is name here
    if (!catDoc) {
      return res.status(400).json({ error: "Parent Category not found" });
    }

    const newSubCategory = new SubCategory({
      subCategory,
      category: catDoc._id, // store ObjectId
    });

    await newSubCategory.save();
    res.status(201).json({ message: "SubCategory added", newSubCategory });
  } catch (err) {
    console.error("Add SubCategory Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get all SubCategories with populated category name
router.get("/", async (req, res) => {
  try {
    const subs = await SubCategory.find()
      .populate("category", "category"); // Only get the 'category' field (name)

    // Format response
    const formatted = subs.map((item) => ({
      _id: item._id,
      subCategory: item.subCategory,
      category: item.category?.category || "N/A",
      status: item.status,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


// GET /api/subcategories/byCategory/:categoryName
router.get("/byCategory/:category", async (req, res) => {
  try {
    const categoryDoc = await Category.findOne({ category: req.params.category });
    if (!categoryDoc) {
      return res.status(404).json({ error: "Category not found" });
    }

    const subCats = await SubCategory.find({ category: categoryDoc._id });
    res.json(subCats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete SubCategory
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SubCategory.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "SubCategory not found" });
    res.status(200).json({ message: "SubCategory and sub-subcategories deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;
