const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUser,
  getAllUsers,
  userPurchaseList,
} = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

router.param("userId", getUserById);

//get single user
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);

//get all users
router.get("/users/:userId", isSignedIn, isAuthenticated, isAdmin, getAllUsers);

//TODO: remove
router.get(
  "/orders/user/:userId",
  isSignedIn,
  isAuthenticated,
  userPurchaseList
);

module.exports = router;
