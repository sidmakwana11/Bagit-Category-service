const express = require("express");
const Category = require("../models/Category.js");
const SubCategory = require("../models/SubCategory");
const SubSubCategory = require("../models/SubSubCategory");
const Products = require("../models/products"); 
 
const router = express.Router();
console.log("🚀 categoryRoutes.js loaded");

router.post("/addCategory", async (req, res) => {
  const { category } = req.body;
  try {
    const trimmedCategory = category.trim(); 

    const newCategory = new Category({ category: trimmedCategory });
    await newCategory.save();

    res.status(201).json({ message: "Category added successfully" });
  } catch (err) {
    console.error("Add Category Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

 
router.get("/hierarchy", async (req, res) => {
  try {
    const categories = await Category.find();
    const fullHierarchy = await Promise.all(categories.map(async (cat) => {
      const subCats = await SubCategory.find({ category: cat._id });
      const subCatsWithSubs = await Promise.all(subCats.map(async (sub) => {
        const subSubs = await SubSubCategory.find({
          category: cat._id,
          subCategory: sub._id
        });
        return {
          subCategory: sub.subCategory,
          subSubCategories: subSubs.map(ss => ss.subSubCategory)
        };
      }));
      return {
        category: cat.category,
        subCategories: subCatsWithSubs
      };
    }));
    return res.json(fullHierarchy);
  } catch (err) {
    console.error("🔥 Hierarchy build error:", err.message);
    console.error(err.stack);
    return res.status(500).json({
      error: "Server error building hierarchy",
      message: err.message
    });
  }
});
 
router.get("/byCategory", async (req, res) => {
  // Normalize and trim the incoming query
  const rawCategory = decodeURIComponent(req.query.category || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  console.log("📥 Incoming category query:", `"${rawCategory}"`);

  if (!rawCategory) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    // Option 1: exact match (with fixed trimming)
    const products = await Products.find({ category: rawCategory });

    // Option 2 (optional): if you want case-insensitive, fuzzy match
    // const products = await Products.find({
    //   category: { $regex: `^${rawCategory}$`, $options: "i" }
    // });

    console.log("✅ Products fetched:", products.length);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.get("/", async (req, res) => {
  try {
    const categories = await Category.find(); // ✅ don't overwrite model
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id); // ✅ fix
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
 
router.put("/update/:id", async (req, res) => {
  const { category } = req.body;
  try {
    const updatedCategory = await Category.findById(req.params.id);
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    updatedCategory.category = category || updatedCategory.category;
    await updatedCategory.save();
    res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, { category: req.body.category }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted with children" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});




module.exports = router;
