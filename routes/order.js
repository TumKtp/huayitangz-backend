const express = require("express");
const router = express.Router();
const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isDoctor,
} = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const { updateStock } = require("../controllers/product");
const { check } = require("express-validator");

const {
  getOrderById,
  createOrder,
  getAllOrders,
  getOrdersForUser,
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
  [check("cart", "Can't place empty cart").notEmpty()],
  // updateStock,
  createOrder
);

//read
router.get(
  "/admin/orders/:userId",
  isSignedIn,
  isAuthenticated,
  isDoctor,
  getAllOrders
);

router.get("/orders/:userId", isSignedIn, isAuthenticated, getOrdersForUser);

//read status of order
router.get(
  "/orders/status/:userId",
  isSignedIn,
  isAuthenticated,
  getOrderStatus
);

//update status of a order
router.put(
  "/orders/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isDoctor,
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
