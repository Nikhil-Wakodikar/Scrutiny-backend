const mongoose = require("mongoose");
const { paginate } = require("./plugins");

const constituency = mongoose.Schema(
  {
    numberOfConstituency: {
      type: Number,
    },
    nameOfConstituency: {
      type: String,
      required: true,
      trim: true,
    },
    electorsCount: { type: Number },
  },
  {
    timestamps: true,
  }
);

constituency.plugin(paginate);

/**
 * @typedef Constituency
 */
const Constituency = mongoose.model(
  "Constituency",
  constituency,
  "constituencies"
);

module.exports = Constituency;
