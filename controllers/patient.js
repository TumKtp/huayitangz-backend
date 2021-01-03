const Patient = require("../models/patient");
exports.createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const newPatient = await patient.save();
    res.json(newPatient);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "Failed to create new patient",
    });
  }
};

exports.getAllPatients = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  let sortBy = req.query.sortBy ? req.query.sortBy : "firstName";
  try {
    const foundPatients = await Patient.find()
      .populate("orders")
      .sort([[sortBy, "asc"]])
      .limit(limit);
    res.json(foundPatients);
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      error: "No patient found",
    });
  }
};
