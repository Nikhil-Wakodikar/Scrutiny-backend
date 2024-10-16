const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { scrutinyService } = require("../services");

const createScrutiny = catchAsync(async (req, res) => {
  const scrunity = await scrutinyService.createScrutiny({
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(scrunity);
});

const getScrutinys = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["givenName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await scrutinyService.queryTrip(filter, {
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

const getScrutiny = catchAsync(async (req, res) => {
  let scrutiny = await scrutinyService.getScrutinyById(req.params.scrutinyId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
  // poll = await poll.populate([
  //   { path: "postedBy", select: "givenName orgName fullName email" },
  // ]);
  res.send(scrutiny);
});

const updateScrutiny = catchAsync(async (req, res) => {
  let scrutiny = await scrutinyService.getScrutinyById(req.params.pollId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
  // if (trip.postedBy.toString() !== req.user._id.toString()) {
  //   throw new ApiError(httpStatus.FORBIDDEN, "Cannot access the trip");
  // }
  scrutiny = await scrutinyService.updateScrutinyById(
    req.params.pollId,
    req.body
  );
  res.send(scrutiny);
});

const deleteScrutiny = catchAsync(async (req, res) => {
  let scrunity = await scrutinyService.getScrutinyById(req.params.scrunity);
  if (!scrunity) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
  scrunity = await scrutinyService.deleteScrutinyById(req.params.tripId);
  res.send(scrunity);
});

const getReport = catchAsync(async (req, res) => {
  let scrutinyReport = await scrutinyService.getReport();
  res.send(scrutinyReport);
});

const getAbstrctReport = catchAsync(async (req, res) => {
  let scrutinyAbstractReport = await scrutinyService.getAbstrctReport();
  res.send(scrutinyAbstractReport);
});

module.exports = {
  createScrutiny,
  getScrutinys,
  getScrutiny,
  updateScrutiny,
  deleteScrutiny,
  getReport,
  getAbstrctReport,
};
