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

const createVotesAccountWithoutAuth = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "file is required");
  }

  const votesAccount = await votesAccountService.createVotesAccount({
    ...req.body,
    fileUrl: "assets/votes-account/" + req.file.filename,
  });
  res.status(httpStatus.CREATED).send();
});

const getVotesAccounts = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["givenName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  if (req.user.constituencyNumber) {
    filter = { ...filter, numberOfConstituency: req.user.constituencyNumber };
  }
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
        ballotUnit: upload.data["नियंत्रण युनिट"]
          ? parseInt(upload.data["नियंत्रण युनिट"])
          : null,
        controlUnit: upload.data["मतदान युनिट"]
          ? parseInt(upload.data["मतदान युनिट"])
          : null,
        vvpat: upload.data["व्हीव्हीपॅट"]
          ? parseInt(upload.data["व्हीव्हीपॅट"])
          : null,
      },
      countOfElectorsAssigned: upload.data[
        "१. मतदान केंद्रावरील मतदारांची एकूण संख्या"
      ]
        ? parseInt(upload.data["१. मतदान केंद्रावरील मतदारांची एकूण संख्या"])
        : null,
      countOfRegistorForVoters: upload.data[
        "२. मतदार नोंदवहीत (नमुना १७-ए) नोंदविलेल्या मतदारांची एकूण संख्या"
      ]
        ? parseInt(
            upload.data[
              "२. मतदार नोंदवहीत (नमुना १७-ए) नोंदविलेल्या मतदारांची एकूण संख्या"
            ]
          )
        : null,
      countOfNotToVote: upload.data[
        "३. नियम ४९-ओ अन्वये मत न नोंदविण्याचे ठरवलेल्या मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "३. नियम ४९-ओ अन्वये मत न नोंदविण्याचे ठरवलेल्या मतदारांची संख्या"
            ]
          )
        : null,
      countOfNotAllowedToVote: upload.data[
        "४. नियम ४९-एम अन्वये मतदान करण्याची परवानगी न दिलेल्या मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "४. नियम ४९-एम अन्वये मतदान करण्याची परवानगी न दिलेल्या मतदारांची संख्या"
            ]
          )
        : null,
      countOfVotesToDeduct: {
        numberOftestVotesCast: {
          totalNumber: upload.data[
            "५. नियम ४९-एमए (डी) अन्वये नोंदविलेली चाचणी मते ही वजा करणे आवश्यक आहे- अ) वजा करावयाच्या चाचणी मतांची एकूण संख्या"
          ]
            ? parseInt(
                upload.data[
                  "५. नियम ४९-एमए (डी) अन्वये नोंदविलेली चाचणी मते ही वजा करणे आवश्यक आहे- अ) वजा करावयाच्या चाचणी मतांची एकूण संख्या"
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
        upload.data[
          "६. मतदान यंत्रानुसार नोंदविण्यात आलेल्या मताची एकूण संख्या"
        ],
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
  createVotesAccountWithoutAuth,
};
