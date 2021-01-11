const { Order, ProductCart } = require("../models/order");

const { validationResult } = require("express-validator");
const { updateStock } = require("./product");
exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "NO order found in DB",
        });
      }
      req.order = order;
      next();
    });
};

//TODO: reject empty cart submission
exports.createOrder = async (req, res) => {
  // Validate req.body from Auth Route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: "Can't submit an empty cart",
    });
  }
  const order = new Order({
    user: req.profile._id,
    products: [],
    patient: req.body.patient,
    herbPackage: req.body.herbPackage || 0,
  });
  const updateStockArray = [];
  try {
    // Save order in DBs
    const sortedCart = req.body.cart.sort((a, b) => {
      if (a.categoryName < b.categoryName) {
        return -1;
      }
      return 1;
    });
    var amount = 0;
    for (item of sortedCart) {
      // Create product cart (a item in cart)
      const productCart = await new ProductCart(item)
        .populate("product")
        .execPopulate();
      updateStockArray.push(productCart);
      // Don't have enoght product in stock
      if (
        (productCart.product.category == process.env.HERB_CATEGORY_ID
          ? productCart.count * order.herbPackage
          : productCart.count) > productCart.product.stock
      ) {
        // delete unused ProductCart item
        await ProductCart.findByIdAndDelete({
          $in: order.products,
        });
        throw { errorTH: "Out of stock" };
      }

      // Calculate price of an individual item
      productCart.item_price =
        productCart.product.category == process.env.HERB_CATEGORY_ID
          ? (
              productCart.product.price *
              productCart.count *
              order.herbPackage
            ).toFixed(1)
          : (productCart.product.price * productCart.count).toFixed(1);
      await productCart.save();

      // Push ID to order
      order.products.push(productCart._id);
      // Calculate total amount
      amount += productCart.item_price;
    }
    order.amount = amount.toFixed(1);

    await order.save();
    await updateStock(updateStockArray, order.herbPackage);
    // // Update Orders List of User
    // try {
    //   await User.findOneAndUpdate(
    //     { _id: req.profile._id },
    //     { $push: { orders: order.products } },
    //     { new: true }
    //   );
    //   console.log("UPDATE USER LIST Done");
    // } catch (e) {
    //   console.log(e);
    //   return res.status(400).json({
    //     error: "Unable to save purchase list",
    //   });
    // }
    res.json(order);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: e.errorTH ? e : "Failed to save your order in DB",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    var allOrder = await Order.find()
      .populate({
        path: "products user patient",
        select: "name firstName lastName address phoneNumber item_price",
        populate: {
          path: "product",
          select: "name price imageUrl",
          populate: {
            path: "category",
            select: "name",
          },
        },
      })
      .exec();

    res.json(allOrder);
  } catch (e) {
    console.log("Wrong push");
    console.log(order.products);
    return res.status(400).json({
      error: "No orders found in DB",
    });
  }
};

exports.getOrdersForUser = async (req, res) => {
  try {
    var allOrder = await Order.find({ user: req.profile._id })
      .populate({
        path: "products user patient",
        select: "name firstName lastName address phoneNumber item_price",
        populate: {
          path: "product",
          select: "name price imageUrl",
          populate: {
            path: "category",
            select: "name",
          },
        },
      })
      .exec();

    res.json(allOrder);
  } catch (e) {
    return res.status(400).json({
      error: "No orders found in DB",
    });
  }
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: req.order._id },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    res.json(updatedOrder);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "Cannot update order status",
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    console.log(req.order);
    const deletedOrder = await Order.findByIdAndDelete(req.order._id);
    res.json({
      message: "Deletion was a success",
      deletedOrder,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "Cannot update order status",
    });
  }
};
