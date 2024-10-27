const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { votesAccountService, fileService } = require("../services");

const createVotesAccount = catchAsync(async (req, res) => {
  let fileUrl = null;
  if (req.file) {
    fileUrl = "assets/votes-account/" + req.file.filename;
  }
  const votesAccount = await votesAccountService.createVotesAccount({
    ...req.body,
    fileUrl,
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

const updateVotesAccount = catchAsync(async (req, res) => {
  let votesAccount = await votesAccountService.getVotesAccountById(
    req.params.votesAccountId
  );
  if (!votesAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, "Votes Account not found");
  }
  votesAccount = await votesAccountService.updateVotesAccountById(
    req.params.votesAccountId,
    req.body
  );
  res.send(votesAccount);
});

const getVotesAccountByImg = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image not found!");
  }
  const upload = await fileService.save(req.file);

  // await fileService.deleteLocal(req.file);

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
      numberOfConstituency: upload.data[
        "Election to House of the People/Legislative Assembly of the State/Union Territory"
      ]
        ? parseInt(
            upload.data[
              "Election to House of the People/Legislative Assembly of the State/Union Territory"
            ]
          )
        : null,
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
          srNoOfelectors: upload.data["Sr. No.(s) of elector(s) in Form 17A"],
        },
        candidateForTestVoteCast: {
          srNo: null,
          nameOfCandidate: null,
          numberOfVotes: null,
        },
      },
      countOfVotesRecordedAsVotingMachine:
        upload.data["Total number of votes recorded as per voting machine"],
      discrepancyNotice:
        upload.data[
          "Whether the total number of votes as shown against item 6 tallies with the total number of votes as shown against item 2 minus numbers of voters deciding not to record votes as against item 3 minus number of vote as against item 4(i.e., 2-3-4) or any discrepancy noticed"
        ],
      numberOfVoterUsedTenderedBallotPapers:
        upload.data[
          "Number of voters to whom tendered Ballot papers were issued under rule 49P"
        ],

      countOfBalllotPapers: {
        receivedForUse: upload.data["(a) recieved for use"],
        issuedToElectors: upload.data["(b) issued to electors"],
        unusedAndReturned: upload.data["(c) not used and returned"],
      },
      accountOfPapersSealsSuppliedForUse: {
        count: upload.data["1 paper seals supplied for use: Total No"],
        from: null,
        to: null,
      },
      accountOfPapersSealsUsed: {
        count: upload.data["2 Paper seals used: Total No"],
        from: null,
        to: null,
      },
      accountOfPapersSealsReturned: {
        count: upload.data["3 Unused paper seals returned to RO Total No"],
        from: null,
        to: null,
      },
      accountOfPapersSealsDamaged: {
        count: upload.data["4 Damaged paper seal, if any: Total No"],
        from: null,
        to: null,
      },
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
  createVotesAccount,
  getVotesAccounts,
  getVotesAccount,
  getVotesAccountByImg,
  updateVotesAccount,
};
