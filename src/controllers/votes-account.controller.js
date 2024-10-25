const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { votesAccountService, fileService } = require("../services");

const createVotesAccount = catchAsync(async (req, res) => {
  const votesAccount = await votesAccountService.createVotesAccount({
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(votesAccount);
});

const getVotesAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["givenName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await votesAccountService.queryVotesAccount(filter, {
    ...options,
  });
  res.send(result);
});

const getVotesAccount = catchAsync(async (req, res) => {
  const votesAccount = await await votesAccountService.getVotesAccountById(
    req.params.votesAccountId
  );

  if (!votesAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, "Record not found");
  }

  res.send(votesAccount);
});

const getVotesAccountByImg = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image not found!");
  }
  const upload = await fileService.save(req.file);

  await fileService.deleteLocal(req.file);

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
      numberOfConstituency: { type: Number },
      nameOfConstituency: upload.data["From Assembly Constituency"],
      numberOfPollingStation: upload.data["Polling Station Number"]
        ? parseInt(upload.data["Polling Station Number"])
        : null,
      nameOfPollingStation: upload.data["Polling Station Name"],
      buCuVvpatUsed: {
        ballotUnit: upload.data["BU"] ? parseInt(upload.data["BU"]) : null,
        controlUnit: upload.data["CU"] ? parseInt(upload.data["CU"]) : null,
        vvpat: upload.data["VVPAT"] ? parseInt(upload.data["VVPAT"]) : null,
      },
      countOfElectorsAssigned: upload.data[
        "Total number of electors assigned to the Polling Station"
      ]
        ? parseInt(
            upload.data[
              "Total number of electors assigned to the Polling Station"
            ]
          )
        : null,
      countOfRegistorForVoters: upload.data[
        "Total number of voters as entered in the Register for Voters (Form 17A)"
      ]
        ? parseInt(
            upload.data[
              "Total number of voters as entered in the Register for Voters (Form 17A)"
            ]
          )
        : null,
      countOfNotToVote: upload.data[
        "Number of voters deciding not to record votes under rule 49-0"
      ]
        ? parseInt(
            upload.data[
              "Number of voters deciding not to record votes under rule 49-0"
            ]
          )
        : null,
      countOfNotAllowedToVote: upload.data[
        "Number of voters not allowed to vote under rule 49M"
      ]
        ? parseInt(
            upload.data["Number of voters not allowed to vote under rule 49M"]
          )
        : null,
      countOfVotesToDeduct: {
        numberOftestVotesCast: {
          totalNumber: upload.data[
            "Test votes recorded under rule 49MA (d) required to be deducted"
          ]
            ? parseInt(
                upload.data[
                  "Test votes recorded under rule 49MA (d) required to be deducted"
                ]
              )
            : null,
          srNoOfelectors: upload.data["Polling Station Name"],
        },
        candidateForTestVoteCast: {
          srNo: upload.data["Polling Station Name"],
          nameOfCandidate: { type: String },
          numberOfVotes: upload.data["Polling Station Name"],
        },
      },
      countOfVotesRecordedAsVotingMachine: upload.data["Polling Station Name"],
      discrepancyNotice: { type: Boolean },
      numberOfVoterUsedTenderedBallotPapers:
        upload.data["Polling Station Name"],

      countOfBalllotPapers: {
        receivedForUse: upload.data["Polling Station Name"],
        issuedToElectors: upload.data["Polling Station Name"],
        unusedAndReturned: upload.data["Polling Station Name"],
      },
      accountOfPapersSealsSuppliedForUse: {
        count: upload.data["Polling Station Name"],
        from: upload.data["Polling Station Name"],
        to: upload.data["Polling Station Name"],
      },
      accountOfPapersSealsUsed: {
        count: upload.data["Polling Station Name"],
        from: upload.data["Polling Station Name"],
        to: upload.data["Polling Station Name"],
      },
      accountOfPapersSealsReturned: {
        count: upload.data["Polling Station Name"],
        from: upload.data["Polling Station Name"],
        to: upload.data["Polling Station Name"],
      },
      accountOfPapersSealsDamaged: {
        count: upload.data["Polling Station Name"],
        from: upload.data["Polling Station Name"],
        to: upload.data["Polling Station Name"],
      },
    };
  } catch (e) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cannot extract properties"
    );
  }
  res.send(upload);
});

module.exports = {
  createVotesAccount,
  getVotesAccounts,
  getVotesAccount,
  getVotesAccountByImg,
};
