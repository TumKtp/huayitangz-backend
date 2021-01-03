const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orders: [
      {
        type: ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);
patientSchema.index({ firstName: 1, lastName: 1 }, { unique: true });
module.exports = mongoose.model("Patient", patientSchema);
