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

const getTrips = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["givenName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await tripService.queryTrip(filter, {
    ...options,
    populate: [
      {
        path: "postedBy",
        select: "givenName orgName fullName email",
      },
    ],
  });
  res.send(result);
});

const getTrip = catchAsync(async (req, res) => {
  let trip = await tripService.getTripById(req.params.tripId);
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, "Trip not found");
  }
  trip = await trip.populate([
    { path: "postedBy", select: "givenName orgName fullName email" },
  ]);
  res.send(trip);
});

module.exports = {
  createTrip,
  getTrips,
  getTrip,
};
