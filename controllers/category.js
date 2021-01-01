const Category = require("../models/category");

// Params Extractor
exports.getCategoryById = async (req, res, next, id) => {
  try {
    const cate = await Category.findById(id);
    req.category = cate;
    next();
  } catch (e) {
    return res.status(400).json({
      error: "Category not found in DB",
    });
  }
};

exports.createCategory = async (req, res) => {
  const category = new Category(req.body);
  try {
    const newCate = await category.save();
    res.json({ newCate });
  } catch (e) {
    return res.status(400).json({
      error: "Unable to save category in DB",
    });
  }
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (e) {
    return res.status(400).json({
      error: "No categories found",
    });
  }
};

exports.updateCategory = async (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  console.log(category);
  try {
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (e) {
    return res.status(400).json({
      error: "Failed to update category",
    });
  }
};

exports.removeCategory = async (req, res) => {
  const category = req.category;
  try {
    await category.remove();
    res.json({
      message: "Successfull deleted",
    });
  } catch (e) {
    return res.status(400).json({
      error: "Failed to delete this category",
    });
  }
};
