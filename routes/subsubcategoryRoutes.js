const express = require("express");
const router = express.Router();
const SubSubCategory = require("../models/subsubcategory");
const Category = require("../models/category");
const SubCategory = require("../models/subcategory");

// Add SubSubCategory
router.post("/addSubSubCategory", async (req, res) => {
  const { subSubCategory, category, subCategory } = req.body;
  try {
    const catDoc = await Category.findOne({ category }); // category name
    const subCatDoc = await SubCategory.findOne({ subCategory }); // subCategory name

    if (!catDoc || !subCatDoc) {
      return res.status(400).json({ error: "Category or SubCategory not found" });
    }

    const newItem = new SubSubCategory({
      subSubCategory,
      category: catDoc._id,
      subCategory: subCatDoc._id,
    });

    await newItem.save();
    res.status(201).json({ message: "SubSubCategory added", newItem });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get all SubSubCategories with populated category and subCategory names
// Get all SubSubCategories with pagination
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const total = await SubSubCategory.countDocuments();
    const items = await SubSubCategory.find()
      .populate("category", "category")
      .populate("subCategory", "subCategory")
      .skip(skip)
      .limit(limit);

    const formatted = items.map((item) => ({
      _id: item._id,
      subSubCategory: item.subSubCategory,
      category: item.category?.category || "N/A",
      subCategory: item.subCategory?.subCategory || "N/A",
      status: item.status,
    }));

    res.status(200).json({
      data: formatted,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

 
// routes/subSubCategoryRoutes.js
router.get("/byCatSubCat", async (req, res) => {
  const { category, subCategory } = req.query;

  try {
    const categoryDoc = await Category.findOne({
      category: new RegExp(`^${category.trim()}$`, "i"),
    });

    const subCategoryDoc = await SubCategory.findOne({
      subCategory: new RegExp(`^${subCategory.trim()}$`, "i"),
    });

    if (!categoryDoc || !subCategoryDoc) {
      console.log("Not found:", {
        categoryQuery: category,
        subCategoryQuery: subCategory,
      });

      return res.status(404).json({ error: "Category or SubCategory not found" });
    }
 
    const items = await SubSubCategory.find({
      category: categoryDoc._id,
      subCategory: subCategoryDoc._id,
    });

    res.status(200).json(items);
  } catch (err) {
    console.error("Error in /byCatSubCat:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Delete SubSubCategory
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SubSubCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "SubSubCategory not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
