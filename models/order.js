const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var productCartSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product",
  },
  name: String,
  count: Number,
  item_price: Number,
});

const ProductCart = mongoose.model("ProductCart", productCartSchema);

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: ObjectId,
        ref: "ProductCart",
      },
    ],
    user: {
      type: ObjectId,
      ref: "User",
    },
    amount: { type: Number },
    patient: {
      type: ObjectId,
      ref: "Patient",
    },
    status: {
      type: String,
      default: "Recieved",
      enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Recieved"],
    },
    updated: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, ProductCart };
