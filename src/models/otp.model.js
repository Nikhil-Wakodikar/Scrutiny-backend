const mongoose = require("mongoose");
const { otpTypes } = require("../config/otp");

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [otpTypes.LOGIN],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    mobileNumber: {
      type: {
        dialCode: String,
        phone: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Otp
 */
const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
