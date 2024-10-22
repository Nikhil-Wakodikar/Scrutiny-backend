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
  let scrutiny = await scrutinyService.getScrutinyById(req.params.scrutinyId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "Scrunity not found");
  }
  scrutiny = await scrutinyService.updateScrutinyById(
    req.params.scrutinyId,
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

  console.log("upload ==> ", upload);
  let obj;
  try {
    obj = {
      numberOfConstituency: upload.data["Assembly Constituency Number"]
        ? parseInt(upload.data["Assembly Constituency Number"])
        : null,
      nameOfConstituency: upload.data["Assembly Constituency Name"],

      numberOfPollingStation: upload.data["Polling Station Number"]
        ? parseInt(upload.data["Polling Station Number"])
        : null,
      nameOfPollingStation: upload.data["Polling Station Name"],

      totalElectors: {
        male: upload.data["Total Electors in the PS"]
          ? upload.data["Total Electors in the PS"]["Male"]
            ? parseInt(upload.data["Total Electors in the PS"]["Male"])
            : null
          : null,
        female: upload.data["Total Electors in the PS"]
          ? upload.data["Total Electors in the PS"]["Female"]
            ? parseInt(upload.data["Total Electors in the PS"]["Female"])
            : null
          : null,
        tg: upload.data["Total Electors in the PS"]
          ? upload.data["Total Electors in the PS"]["TG"]
            ? parseInt(upload.data["Total Electors in the PS"]["TG"])
            : null
          : null,
        total: upload.data["Total Electors in the PS"]
          ? upload.data["Total Electors in the PS"]["Total"]
            ? parseInt(upload.data["Total Electors in the PS"]["Total"])
            : null
          : null,
      },
      personsVoted: {
        male: upload.data["Total persons voted in PS"]
          ? upload.data["Total persons voted in PS"]["Male"]
            ? parseInt(upload.data["Total persons voted in PS"]["Male"])
            : null
          : null,
        female: upload.data["Total persons voted in PS"]
          ? upload.data["Total persons voted in PS"]["Female"]
            ? parseInt(upload.data["Total persons voted in PS"]["Female"])
            : null
          : null,
        tg: upload.data["Total persons voted in PS"]
          ? upload.data["Total persons voted in PS"]["TG"]
            ? parseInt(upload.data["Total persons voted in PS"]["TG"])
            : null
          : null,
        total: upload.data["Total persons voted in PS"]
          ? upload.data["Total persons voted in PS"]["Total"]
            ? parseInt(upload.data["Total persons voted in PS"]["Total"])
            : null
          : null,
      },
      tenderedVotes: upload.data["Number of Tendered votes"]
        ? upload.data["Number of Tendered votes"]
          ? parseInt(upload.data["Number of Tendered votes"])
          : null
        : null,
      challengedVotes: upload.data["Number of challenged votes"]
        ? upload.data["Number of challenged votes"]
          ? parseInt(upload.data["Number of challenged votes"])
          : null
        : null,
      proxyVotesByCSVs: upload.data["Number of Proxy votes by CSVs"]
        ? upload.data["Number of Proxy votes by CSVs"]
          ? parseInt(upload.data["Number of Proxy votes by CSVs"])
          : null
        : null,
      votersEPIC: upload.data[
        "Number of electors who exercised their right of vote on the basis of EPIC"
      ]
        ? parseInt(
            upload.data[
              "Number of electors who exercised their right of vote on the basis of EPIC"
            ]
          )
        : null,
      votersAlternativeDocument: upload.data[
        "Number of electors who exercised their right of vote on the basis alternative document"
      ]
        ? parseInt(
            upload.data[
              "Number of electors who exercised their right of vote on the basis alternative document"
            ]
          )
        : null,
      votersRule49O: upload.data[
        "Total voters who exercised their right under Rule 49 O, who decided not to record vote"
      ]
        ? parseInt(
            upload.data[
              "Total voters who exercised their right under Rule 49 O, who decided not to record vote"
            ]
          )
        : null,
      pollingAgents: upload.data[
        "Number of polling agents in the polling station"
      ]
        ? parseInt(
            upload.data["Number of polling agents in the polling station"]
          )
        : null,
      overseasElectors: upload.data[
        "Number of overseas electors who voted in the poll"
      ]
        ? parseInt(
            upload.data["Number of overseas electors who voted in the poll"]
          )
        : null,
      buCuVvpatUsed: {
        ballotUnit: upload.data["Number of units used"]
          ? upload.data["Number of units used"]["BU"]
            ? parseInt(upload.data["Number of units used"]["BU"])
            : null
          : null,
        controlUnit: upload.data["Number of units used"]
          ? upload.data["Number of units used"]["CU"]
            ? parseInt(upload.data["Number of units used"]["CU"])
            : null
          : null,
        vvpat: upload.data["Number of units used"]
          ? upload.data["Number of units used"]["VVPAT"]
            ? parseInt(upload.data["Number of units used"]["VVPAT"])
            : null
          : null,
      },
      buCuVvpatChanged: {
        ballotUnit: null,
        controlUnit: null,
        vvpat: null,
      },
      changeTimeReason:
        upload.data["If so, the time when changed and reason for it"],
      totalAsdVoters: upload.data["Total ASD voters in the ASD voters list"]
        ? parseInt(upload.data["Total ASD voters in the ASD voters list"])
        : null,
      totalAsdVotesCast: upload.data[
        "Total persons who cast their vote from the ASD voters list"
      ]
        ? parseInt(
            upload.data[
              "Total persons who cast their vote from the ASD voters list"
            ]
          )
        : null,
      violencePollInterruption:
        upload.data[
          "Any incident of violence or poll interruption due to any reason (Y/N)"
        ],
      complaintsReceived:
        upload.data[
          "Any complaints received with respect to polling station (Y/N)"
        ],
      recommendataionOfRepoll: null,
      countOfVotesFromEDC: null,
      complaintAboutEVM: false,
    };
  } catch (e) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cannot extract properties"
    );
  }
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
