const mongoose = require("mongoose");
const { paginate } = require("./plugins");

const polingStation = mongoose.Schema(
  {
    numberOfConstituency: {
      type: Number,
    },
    nameOfPollingStation: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfPollingStation: { type: Number },
    electorsCount: { type: Number },
  },
  {
    timestamps: true,
  }
);

polingStation.plugin(paginate);

/**
 * @typedef PolingStation
 */
const PolingStation = mongoose.model(
  "PolingStation",
  polingStation,
  "polingStations"
);

module.exports = PolingStation;
