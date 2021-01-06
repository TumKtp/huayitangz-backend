const express = require("express");
const router = express.Router();
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const { updateStock } = require("../controllers/product");
const { check } = require("express-validator");

const {
  getOrderById,
  createOrder,
  getAllOrders,
  getOrderStatus,
  updateStatus,
  deleteOrder,
} = require("../controllers/order");

//params
router.param("userId", getUserById);
router.param("orderId", getOrderById);

//Actual routes

//create
router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  [check("cart", "name should be at least 3 char").notEmpty()],
  updateStock,
  createOrder
);

//read
router.get(
  "/orders/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);

//read status of order
router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);

//update status of a order
router.put(
  "/orders/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStatus
);

//delete order
router.delete(
  "/orders/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteOrder
);

module.exports = router;
