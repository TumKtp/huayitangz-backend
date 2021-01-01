const express = require("express");
const router = express.Router();

const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { createPatient, getAllPatients } = require("../controllers/patient");
const { getUserById } = require("../controllers/user");

// All of PARAMS
router.param("userId", getUserById);

// Get all patients credentials
router.get(
  "/patients/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllPatients
);

// Create new patient
router.post(
  "/patient/create/:userId",
  isSignedIn,
  isAuthenticated,
  createPatient
);

module.exports = router;
