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
  let filter = pick(req.query, [
    "pollingAgents",
    "complaintsReceived",
    "tenderedVotes",
    "votersUsedAlternateDoc",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  if (filter.tenderedVotes) {
    filter = { tenderedVotes: { $gt: 5 } };
  }
  if (filter.votersUsedAlternateDoc) {
    filter = {
      $expr: {
        $gt: [
          "$votersAlternativeDocument",
          { $multiply: ["$votersEPIC", 0.25] },
        ],
      },
    };
  }
  const result = await scrutinyService.queryScrutiny(filter, {
    ...options,
  });
  res.send(result);
});

const getAbstrctReport = catchAsync(async (req, res) => {
  let matchQuery = pick(req.query, [
    "pollingAgents",
    "complaintsReceived",
    "tenderedVotes",
    "votersUsedAlternateDoc",
  ]);
  if (matchQuery.tenderedVotes) {
    matchQuery = { tenderedVotes: { $gt: 5 } };
  }
  if (matchQuery.votersUsedAlternateDoc) {
    matchQuery = {
      $expr: {
        $gt: [
          "$votersAlternativeDocument",
          { $multiply: ["$votersEPIC", 0.25] },
        ],
      },
    };
  }
  let abstractReport = await scrutinyService.getAbstrctReport({
    ...matchQuery,
  });
  let result = { results: abstractReport };
  res.send(result);
});

const getScrutiny = catchAsync(async (req, res) => {
  let scrutiny = await scrutinyService.getScrutinyById(req.params.scrutinyId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
  res.send(scrutiny);
});

const updateScrutiny = catchAsync(async (req, res) => {
  let scrutiny = await scrutinyService.getScrutinyById(req.params.pollId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
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

module.exports = {
  createScrutiny,
  getScrutinys,
  getScrutiny,
  updateScrutiny,
  deleteScrutiny,
  getAbstrctReport,
};
