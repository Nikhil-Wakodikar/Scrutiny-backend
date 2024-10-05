const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { tripService } = require("../services");

const createTrip = catchAsync(async (req, res) => {
  const trip = await tripService.createTrip({
    ...req.body,
    postedBy: req.user._id,
  });
  res.status(httpStatus.CREATED).send(trip);
});

module.exports = {
  createTrip,
};
