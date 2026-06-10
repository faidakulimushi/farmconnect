const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name) { res.status(400); throw new Error("Category name is required"); }
  const category = await Category.create({ name, description, image });
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }
  const { name, description, image, isActive } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (image) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;
  const updated = await category.save();
  res.json({ success: true, category: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error("Category not found"); }
  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
