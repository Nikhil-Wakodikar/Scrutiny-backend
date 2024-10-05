const mongoose = require("mongoose");

const tripSchema = mongoose.Schema(
  {
    destinations: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    startLocations: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    duration: {
      type: Object,
      days: {
        type: Number,
        required: true,
      },
      nights: {
        type: Number,
        required: true,
      },
    },
    pkgInclude: [
      {
        type: String,
      },
    ],
    contactPerson: {
      required: true,
      type: Object,
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: Object,
        countryCode: {
          type: Number,
          required: true,
        },
        number: {
          type: Number,
          required: true,
        },
      },
      email: {
        type: String,
        required: true,
      },
      isPhoneVerified: {
        type: Boolean,
        default: false,
      },
      isContactEmailVerified: {
        type: Boolean,
        default: false,
      },
    },
    totalSeatsAvailable: {
      type: Number,
    },
    clickableLink: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    cost: {
      type: Number,
      required: true,
    },
    otherDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Token
 */
const Trip = mongoose.model("trip", tripSchema);

module.exports = Trip;
