const { Order, ProductCart } = require("../models/order");
const product = require("../models/product");
const User = require("../models/user");

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
  const order = new Order({
    user: req.profile._id,
    products: [],
    patient: req.body.patient,
  });
  try {
    // Save ordder in DB
    var amount = 0;
    for (item of req.body.cart) {
      // Create product cart (a item in cart)
      const productCart = await new ProductCart(item)
        .populate("product")
        .execPopulate();
      // console.log(productCart);
      // Calculate price of an individual item
      productCart.item_price = productCart.product.price * productCart.count;
      await productCart.save();
      // Push ID to order
      order.products.push(productCart._id);
      // Calculate total amount
      amount += productCart.item_price;
    }
    order.amount = amount;
    await order.save();

    // Update Orders List of User
    try {
      await User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { orders: order.products } },
        { new: true }
      );
      console.log("UPDATE USER LIST Done");
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        error: "Unable to save purchase list",
      });
    }
    res.json(order);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "Failed to save your order in DB",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const allOrder = await Order.find()
      .populate("user patient", "_id name firstName lastName address")
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
