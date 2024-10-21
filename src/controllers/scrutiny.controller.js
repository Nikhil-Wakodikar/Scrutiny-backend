const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { scrutinyService, fileService } = require("../services");

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
    filter = { tenderedVotes: { $gt: 4 } };
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
    matchQuery = { tenderedVotes: { $gt: 4 } };
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

const getScrutinyDataByImg = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image not found!");
  }
  const upload = await fileService.save(req.file);

  if (!upload) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      upload.code || `Something went wrong !!`
    );
  }

  let obj = {
    numberOfConstituency: parseInt(upload.data["Assembly Constituency Number"]),
    nameOfConstituency: upload.data["Assembly Constituency Name"],

    numberOfPollingStation: parseInt(upload.data["Polling Station Number"]),
    nameOfPollingStation: upload.data["Polling Station Name"],

    totalElectors: {
      male: upload.data["Total Electors in the PS"]
        ? parseInt(upload.data["Total Electors in the PS"]["Male"])
        : null,
      female: upload.data["Total Electors in the PS"]
        ? parseInt(upload.data["Total Electors in the PS"]["Female"])
        : null,
      tg: upload.data["Total Electors in the PS"]
        ? parseInt(upload.data["Total Electors in the PS"]["TG"])
        : null,
      total: upload.data["Total Electors in the PS"]
        ? parseInt(upload.data["Total Electors in the PS"]["Total"])
        : null,
    },
    personsVoted: {
      male: upload.data["Total persons voted in PS"]
        ? parseInt(upload.data["Total persons voted in PS"]["Male"])
        : null,
      female: upload.data["Total persons voted in PS"]
        ? parseInt(upload.data["Total persons voted in PS"]["Female"])
        : null,
      tg: upload.data["Total persons voted in PS"]
        ? parseInt(upload.data["Total persons voted in PS"]["TG"])
        : null,
      total: upload.data["Total persons voted in PS"]
        ? parseInt(upload.data["Total persons voted in PS"]["Total"])
        : null,
    },
    tenderedVotes: parseInt(upload.data["Number of Tendered votes"]),
    challengedVotes: parseInt(upload.data["Number of challenged votes"]),
    proxyVotesByCSVs: parseInt(upload.data["Number of Proxy votes by CSVs"]),
    votersEPIC: parseInt(
      upload.data[
        "Number of electors who exercised their right of vote on the basis of EPIC"
      ]
    ),
    votersAlternativeDocument: parseInt(
      upload.data[
        "Number of electors who exercised their right of vote on the basis alternative document"
      ]
    ),
    votersRule49O: parseInt(
      upload.data[
        "Total voters who exercised their right under Rule 49 O, who decided not to record vote"
      ]
    ),
    pollingAgents: parseInt(
      upload.data["Number of polling agents in the polling station"]
    ),
    overseasElectors: parseInt(
      upload.data["Number of overseas electors who voted in the poll"]
    ),
    buCuVvpatUsed: {
      ballotUnit: upload.data["Number of units used"]
        ? parseInt(upload.data["Number of units used"]["BU"])
        : null,
      controlUnit: upload.data["Number of units used"]
        ? parseInt(upload.data["Number of units used"]["CU"])
        : null,
      vvpat: upload.data["Number of units used"]
        ? parseInt(upload.data["Number of units used"]["VVPAT"])
        : null,
    },
    buCuVvpatChanged: {
      ballotUnit: null,
      controlUnit: null,
      vvpat: null,
    },
    changeTimeReason:
      upload.data["If so, the time when changed and reason for it"],
    totalAsdVoters: parseInt(
      upload.data["Total ASD voters in the ASD voters list"]
    ),
    totalAsdVotesCast: parseInt(
      upload.data["Total persons who cast their vote from the ASD voters list"]
    ),
    violencePollInterruption:
      upload.data[
        "Any incident of violence or poll interruption due to any reason (Y/N)"
      ],
    complaintsReceived:
      upload.data[
        "Any complaints received with respect to polling station (Y/N)"
      ],
    recommendataionOfRepoll: null,
  };
  res.send(obj);
});

module.exports = {
  createScrutiny,
  getScrutinys,
  getScrutiny,
  updateScrutiny,
  deleteScrutiny,
  getAbstrctReport,
  getScrutinyDataByImg,
};
