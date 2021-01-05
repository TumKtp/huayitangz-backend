const Product = require("../models/product");
//TODO: add unique to product
exports.getProductById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id).populate("category");
    req.product = product;
    console.log("PARAMS PRODUCT: " + product);
    next();
  } catch (e) {
    return res.status(400).json({
      error: "Product not found",
    });
  }
  //asdasd
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.json(newProduct);
    console.log("ADDED PRODUCT: " + newProduct);
  } catch (e) {
    res.status(400).json({
      error: "Saving product in DB failed",
    });
  }
};

exports.getProduct = (req, res) => {
  return res.json(req.product);
};

// delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = req.product;
    const deletedProduct = await product.remove();
    res.json({
      message: "Deletion was a success",
      deletedProduct,
    });
  } catch (e) {
    res.status(400).json({
      error: "Updation of product failed",
    });
  }
};

// update
exports.updateProduct = async (req, res) => {
  try {
    console.log(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: req.product._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updatedProduct);
  } catch (e) {
    console.log(e);
    res.status(400).json({
      error: "Updation of product failed",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  try {
    const foundProducts = await Product.find()
      .populate("category")
      .sort([[sortBy, "asc"]])
      .limit(limit);
    res.json(foundProducts);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "No product FOUND",
    });
  }
};

//TODO: Bug when out of stock
exports.updateStock = async (req, res, next) => {
  let myOperations = req.body.cart.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod.product },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  try {
    await Product.bulkWrite(myOperations);
    next();
  } catch (e) {
    return res.status(400).json({
      error: "Bulk operation failed",
    });
  }
};
