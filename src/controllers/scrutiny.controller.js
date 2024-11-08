const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { scrutinyService, fileService, userService } = require("../services");

const createScrutiny = catchAsync(async (req, res) => {
  if (!(await userService.getScrutinySubmit(req.user._id))) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Scrutiny submition not allowed"
    );
  }
  let fileUrl = null;
  if (req.file) {
    fileUrl = "assets/scrutiny/" + req.file.filename;
  }
  const scrutiny = await scrutinyService.createScrutiny({
    ...req.body,
    fileUrl,
  });
  // console.log("scrutiny==>", scrutiny);
  if (scrutiny) {
    if (req.user.scrutiny) {
      let scrutinyTemp = await scrutinyService.getScrutinyById(
        req.user.scrutiny
      );
      // console.log(scrutinyTemp);
      if (scrutinyTemp) {
        if (scrutinyTemp.fileUrl) {
          // delete file
          await fileService.deleteLocal("src/" + scrutinyTemp.fileUrl);
          // console.log(scrutinyTemp.fileUrl);
        }
        const del = await scrutinyService.deleteScrutinyById(scrutinyTemp._id);
        // console.log(del);
      }
    }
    await userService.updateUserById(req.user._id, {
      scrutiny: scrutiny._id,
    });
    // console.log("user==>", req.user);
  }
  res.status(httpStatus.CREATED).send(scrutiny);
});

const createScrutinyWithoutAuth = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "file is required");
  }

  const scrutiny = await scrutinyService.createScrutiny({
    ...req.body,
    fileUrl: "assets/scrutiny/" + req.file.filename,
  });

  let message = scrutiny._id.toString();

  res.status(httpStatus.CREATED).send({ message });
});

const getScrutinys = catchAsync(async (req, res) => {
  let filter = pick(req.query, [
    "pollingAgents",
    "complaintsReceived",
    "tenderedVotes",
    "votersUsedAlternateDoc",
    "numberOfConstituency",
    "complaintAboutEVM",
    "avgPollingPercent",
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
  if (filter.identifyAsASD) {
    filter = {
      $expr: {
        $gt: [
          "$totalAsdVotesCast",
          { $multiply: [0.1, "$personsVoted.total"] },
        ],
      },
    };
  }
  if (req.user.constituencyNumber) {
    filter = { ...filter, numberOfConstituency: req.user.constituencyNumber };
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
    "complaintAboutEVM",
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

  if (matchQuery.identifyAsASD) {
    matchQuery = {
      $expr: {
        $gt: [
          "$totalAsdVotesCast",
          { $multiply: [0.1, "$personsVoted.total"] },
        ],
      },
    };
  }

  if (req.user.constituencyNumber) {
    matchQuery = {
      ...matchQuery,
      numberOfConstituency: req.user.constituencyNumber,
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
    throw new ApiError(httpStatus.NOT_FOUND, "scrutiny not found");
  }
  res.send(scrutiny);
});

const updateScrutiny = catchAsync(async (req, res) => {
  if (
    req.user.type !== "ro" &&
    !(await userService.getScrutinySubmit(req.user._id))
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Scrutiny submition not allowed"
    );
  }
  let scrutiny = await scrutinyService.getScrutinyById(req.params.scrutinyId);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "scrutiny not found");
  }
  scrutiny = await scrutinyService.updateScrutinyById(
    req.params.scrutinyId,
    req.body
  );
  res.send(scrutiny);
});

const deleteScrutiny = catchAsync(async (req, res) => {
  let scrutiny = await scrutinyService.getScrutinyById(req.params.scrutiny);
  if (!scrutiny) {
    throw new ApiError(httpStatus.NOT_FOUND, "scrutiny not found");
  }
  scrutiny = await scrutinyService.deleteScrutinyById(req.params.tripId);
  res.send(scrutiny);
});

const avgPollingPercent = catchAsync(async (req, res) => {
  const { avgRatio, electorsCount, numberOfConstituency, nameOfConstituency } =
    await scrutinyService.findGlobalAvgVoting(req.user.constituencyNumber);
  const margin = avgRatio * 0.15;
  const lowerLimit = avgRatio - margin;
  const upperLimit = avgRatio + margin;

  const results = await scrutinyService.find15percentLimit(
    req.user.constituencyNumber,
    upperLimit,
    lowerLimit,
    electorsCount
  );

  let responseObj;
  if (req.query.abstract) {
    const { count } = results;
    responseObj = {
      numberOfConstituency,
      nameOfConstituency,
      electorsCount,
      count,
    };
  } else {
    const { _id, ...rest } = results;
    responseObj = {
      ...rest,
      avgRatio,
      lowerLimit,
      upperLimit,
      electorsCount,
      numberOfConstituency,
      nameOfConstituency,
    };
  }

  res.send(responseObj);
});

const getScrutinyDataByImg = catchAsync(async (req, res) => {
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
  // try {
  //   obj = {
  //     numberOfConstituency: upload.data["Assembly Constituency Number"]
  //       ? parseInt(upload.data["Assembly Constituency Number"])
  //       : null,
  //     nameOfConstituency: upload.data["Assembly Constituency Name"],

  //     numberOfPollingStation: upload.data["Polling Station Number"]
  //       ? parseInt(upload.data["Polling Station Number"])
  //       : null,
  //     nameOfPollingStation: upload.data["Polling Station Name"],

  //     totalElectors: {
  //       male: upload.data["Total Electors in the PS"]
  //         ? upload.data["Total Electors in the PS"]["Male"]
  //           ? parseInt(upload.data["Total Electors in the PS"]["Male"])
  //           : null
  //         : null,
  //       female: upload.data["Total Electors in the PS"]
  //         ? upload.data["Total Electors in the PS"]["Female"]
  //           ? parseInt(upload.data["Total Electors in the PS"]["Female"])
  //           : null
  //         : null,
  //       tg: upload.data["Total Electors in the PS"]
  //         ? upload.data["Total Electors in the PS"]["TG"]
  //           ? parseInt(upload.data["Total Electors in the PS"]["TG"])
  //           : null
  //         : null,
  //       total: upload.data["Total Electors in the PS"]
  //         ? upload.data["Total Electors in the PS"]["Total"]
  //           ? parseInt(upload.data["Total Electors in the PS"]["Total"])
  //           : null
  //         : null,
  //     },
  //     personsVoted: {
  //       male: upload.data["Total persons voted in PS"]
  //         ? upload.data["Total persons voted in PS"]["Male"]
  //           ? parseInt(upload.data["Total persons voted in PS"]["Male"])
  //           : null
  //         : null,
  //       female: upload.data["Total persons voted in PS"]
  //         ? upload.data["Total persons voted in PS"]["Female"]
  //           ? parseInt(upload.data["Total persons voted in PS"]["Female"])
  //           : null
  //         : null,
  //       tg: upload.data["Total persons voted in PS"]
  //         ? upload.data["Total persons voted in PS"]["TG"]
  //           ? parseInt(upload.data["Total persons voted in PS"]["TG"])
  //           : null
  //         : null,
  //       total: upload.data["Total persons voted in PS"]
  //         ? upload.data["Total persons voted in PS"]["Total"]
  //           ? parseInt(upload.data["Total persons voted in PS"]["Total"])
  //           : null
  //         : null,
  //     },
  //     tenderedVotes: upload.data["Number of Tendered votes"]
  //       ? upload.data["Number of Tendered votes"]
  //         ? parseInt(upload.data["Number of Tendered votes"])
  //         : null
  //       : null,
  //     challengedVotes: upload.data["Number of challenged votes"]
  //       ? upload.data["Number of challenged votes"]
  //         ? parseInt(upload.data["Number of challenged votes"])
  //         : null
  //       : null,
  //     proxyVotesByCSVs: upload.data["Number of Proxy votes by CSVs"]
  //       ? upload.data["Number of Proxy votes by CSVs"]
  //         ? parseInt(upload.data["Number of Proxy votes by CSVs"])
  //         : null
  //       : null,
  //     votersEPIC: upload.data[
  //       "Number of electors who exercised their right of vote on the basis of EPIC"
  //     ]
  //       ? parseInt(
  //           upload.data[
  //             "Number of electors who exercised their right of vote on the basis of EPIC"
  //           ]
  //         )
  //       : null,
  //     votersAlternativeDocument: upload.data[
  //       "Number of electors who exercised their right of vote on the basis alternative document"
  //     ]
  //       ? parseInt(
  //           upload.data[
  //             "Number of electors who exercised their right of vote on the basis alternative document"
  //           ]
  //         )
  //       : null,
  //     votersRule49O: upload.data[
  //       "Total voters who exercised their right under Rule 49 O, who decided not to record vote"
  //     ]
  //       ? parseInt(
  //           upload.data[
  //             "Total voters who exercised their right under Rule 49 O, who decided not to record vote"
  //           ]
  //         )
  //       : null,
  //     pollingAgents: upload.data[
  //       "Number of polling agents in the polling station"
  //     ]
  //       ? parseInt(
  //           upload.data["Number of polling agents in the polling station"]
  //         )
  //       : null,
  //     overseasElectors: upload.data[
  //       "Number of overseas electors who voted in the poll"
  //     ]
  //       ? parseInt(
  //           upload.data["Number of overseas electors who voted in the poll"]
  //         )
  //       : null,
  //     buCuVvpatUsed: {
  //       ballotUnit: upload.data["Number of units used"]
  //         ? upload.data["Number of units used"]["BU"]
  //           ? parseInt(upload.data["Number of units used"]["BU"])
  //           : null
  //         : null,
  //       controlUnit: upload.data["Number of units used"]
  //         ? upload.data["Number of units used"]["CU"]
  //           ? parseInt(upload.data["Number of units used"]["CU"])
  //           : null
  //         : null,
  //       vvpat: upload.data["Number of units used"]
  //         ? upload.data["Number of units used"]["VVPAT"]
  //           ? parseInt(upload.data["Number of units used"]["VVPAT"])
  //           : null
  //         : null,
  //     },
  //     buCuVvpatChanged: {
  //       ballotUnit: null,
  //       controlUnit: null,
  //       vvpat: null,
  //     },
  //     changeTimeReason:
  //       upload.data["If so, the time when changed and reason for it"],
  //     totalAsdVoters: upload.data["Total ASD voters in the ASD voters list"]
  //       ? parseInt(upload.data["Total ASD voters in the ASD voters list"])
  //       : null,
  //     totalAsdVotesCast: upload.data[
  //       "Total persons who cast their vote from the ASD voters list"
  //     ]
  //       ? parseInt(
  //           upload.data[
  //             "Total persons who cast their vote from the ASD voters list"
  //           ]
  //         )
  //       : null,
  //     violencePollInterruption:
  //       upload.data[
  //         "Any incident of violence or poll interruption due to any reason (Y/N)"
  //       ],
  //     complaintsReceived:
  //       upload.data[
  //         "Any complaints received with respect to polling station (Y/N)"
  //       ],
  //     recommendataionOfRepoll: null,
  //     countOfVotesFromEDC: null,
  //     complaintAboutEVM: false,
  //   };
  // } catch (e) {
  //   throw new ApiError(
  //     httpStatus.INTERNAL_SERVER_ERROR,
  //     "Cannot extract properties"
  //   );
  // }

  try {
    obj = {
      numberOfConstituency: upload.data["विधानसभा मतदार संघाचे नंबर"]
        ? parseInt(upload.data["विधानसभा मतदार संघाचे नंबर"])
        : null,
      nameOfConstituency: upload.data.hasOwnProperty(
        "विधानसभा मतदार संघाचे नाव"
      )
        ? upload.data["विधानसभा मतदार संघाचे नाव"]
        : null,

      numberOfPollingStation: upload.data["मतदान केंद्राचे क्रमांक"]
        ? parseInt(upload.data["मतदान केंद्राचे क्रमांक"])
        : null,
      nameOfPollingStation: upload.data.hasOwnProperty("मतदान केंद्राचे नाव")
        ? upload.data["मतदान केंद्राचे नाव"]
        : null,

      totalElectors: {
        male: upload.data["एकूण मतदारांची संख्या पुरुष"]
          ? parseInt(upload.data["एकूण मतदारांची संख्या पुरुष"])
          : null,
        female: upload.data["एकूण मतदारांची संख्या महिला"]
          ? parseInt(upload.data["एकूण मतदारांची संख्या महिला"])
          : null,
        tg: upload.data["एकूण मतदारांची संख्या तृतीय पंथी"]
          ? parseInt(upload.data["एकूण मतदारांची संख्या तृतीय पंथी"])
          : null,
        total: upload.data["एकूण मतदारांची संख्या एकूण"]
          ? parseInt(upload.data["एकूण मतदारांची संख्या एकूण"])
          : null,
      },
      personsVoted: {
        male: upload.data["मतदान केंद्रात मतदान केलेल्या पुरुष"]
          ? parseInt(upload.data["मतदान केंद्रात मतदान केलेल्या पुरुष"])
          : upload.data["मतदान केंद्रात मतदान केलेल्या पुरुष व्यक्तींची संख्या"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या पुरुष व्यक्तींची संख्या"
              ]
            )
          : upload.data["मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या पुरुष"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या पुरुष"
              ]
            )
          : null,
        female: upload.data["मतदान केंद्रात मतदान केलेल्या महिला"]
          ? parseInt(upload.data["मतदान केंद्रात मतदान केलेल्या महिला"])
          : upload.data["मतदान केंद्रात मतदान केलेल्या महिला व्यक्तींची संख्या"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या महिला व्यक्तींची संख्या"
              ]
            )
          : upload.data["मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या महिला"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या महिला"
              ]
            )
          : null,

        tg: upload.data["मतदान केंद्रात मतदान केलेल्या तृतीय पंथी"]
          ? parseInt(upload.data["मतदान केंद्रात मतदान केलेल्या तृतीय पंथी"])
          : upload.data[
              "मतदान केंद्रात मतदान केलेल्या तृतीय पंथी व्यक्तींची संख्या"
            ]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या तृतीय पंथी व्यक्तींची संख्या"
              ]
            )
          : upload.data[
              "मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या तृतीय पंथी"
            ]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या तृतीय पंथी"
              ]
            )
          : null,

        total: upload.data["मतदान केंद्रात मतदान केलेल्या एकूण"]
          ? parseInt(upload.data["मतदान केंद्रात मतदान केलेल्या एकूण"])
          : upload.data["मतदान केंद्रात मतदान केलेल्या एकूण व्यक्तींची संख्या"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या एकूण व्यक्तींची संख्या"
              ]
            )
          : upload.data["मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या एकूण"]
          ? parseInt(
              upload.data[
                "मतदान केंद्रात मतदान केलेल्या व्यक्तींची संख्या एकूण"
              ]
            )
          : null,
      },

      tenderedVotes: upload.data["प्रदान मतांची संख्या"]
        ? parseInt(upload.data["प्रदान मतांची संख्या"])
        : upload.data["प्रदन मतांची संख्या"]
        ? parseInt(upload.data["प्रदन मतांची संख्या"])
        : null,
      challengedVotes: upload.data["आक्षेपित मतांची संख्या"]
        ? upload.data["आक्षेपित मतांची संख्या"]
          ? parseInt(upload.data["आक्षेपित मतांची संख्या"])
          : null
        : null,
      proxyVotesByCSVs: upload.data[
        "वर्गीकृत सेवा मतदारद्वारे बदली व्यक्तींच्या मतांची संख्या"
      ]
        ? upload.data[
            "वर्गीकृत सेवा मतदारद्वारे बदली व्यक्तींच्या मतांची संख्या"
          ]
          ? parseInt(
              upload.data[
                "वर्गीकृत सेवा मतदारद्वारे बदली व्यक्तींच्या मतांची संख्या"
              ]
            )
          : null
        : null,
      votersEPIC: upload.data[
        "मतदार छयाचित्र ओळखपत्राचा आधारे मतदान हक्क बजावलेल्या मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "मतदार छयाचित्र ओळखपत्राचा आधारे मतदान हक्क बजावलेल्या मतदारांची संख्या"
            ]
          )
        : null,
      votersAlternativeDocument: upload.data[
        "पर्यायी कागदपत्रांच्या आधारे मतदान हक्क बजावलेल्या मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "पर्यायी कागदपत्रांच्या आधारे मतदान हक्क बजावलेल्या मतदारांची संख्या"
            ]
          )
        : null,
      votersRule49O: upload.data[
        "नियम ४९ओ अन्वये ज्यांनी त्याच्या अधिकाराचा वापर करून मत न देण्याचे ठरविले आहे अशा मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "नियम ४९ओ अन्वये ज्यांनी त्याच्या अधिकाराचा वापर करून मत न देण्याचे ठरविले आहे अशा मतदारांची संख्या"
            ]
          )
        : null,
      pollingAgents: upload.data["मतदान केंद्रातील मतदान प्रतिनिधींची संख्या"]
        ? parseInt(upload.data["मतदान केंद्रातील मतदान प्रतिनिधींची संख्या"])
        : null,
      overseasElectors: upload.data[
        "ज्यांनी मतदान केले आहे अशा समुद्रापार मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "ज्यांनी मतदान केले आहे अशा समुद्रापार मतदारांची संख्या"
            ]
          )
        : null,
      buCuVvpatUsed: {
        ballotUnit: upload.data["वापर केलेले युनिट ची संख्या BU"]
          ? parseInt(upload.data["वापर केलेले युनिट ची संख्या BU"])
          : null,
        controlUnit: upload.data["वापर केलेले युनिट ची संख्या CU"]
          ? parseInt(upload.data["वापर केलेले युनिट ची संख्या CU"])
          : null,
        vvpat: upload.data["वापर केलेले युनिट ची संख्या VVPAT"]
          ? parseInt(upload.data["वापर केलेले युनिट ची संख्या VVPAT"])
          : null,
      },
      buCuVvpatChanged: {
        isBallotUnit:
          upload.data["युनिट बदलले किंवा बदलून नवीन घेतले होते का (Y/N) BU"],
        isControlUnit:
          upload.data["युनिट बदलले किंवा बदलून नवीन घेतले होते का (Y/N) CU"],
        isVvpat:
          upload.data["युनिट बदलले किंवा बदलून नवीन घेतले होते का (Y/N) VVPAT"],
      },
      changeTimeReason:
        upload.data[
          "बदलले असल्यास कधी बदलले ती वेळ आणि बदलण्याचे कारण काय होते"
        ],
      totalAsdVoters: upload.data[
        "मतदार यादीतील अनुपस्थित/स्थलांतरित/मृत मतदारांची संख्या"
      ]
        ? parseInt(
            upload.data[
              "मतदार यादीतील अनुपस्थित/स्थलांतरित/मृत मतदारांची संख्या"
            ]
          )
        : null,
      totalAsdVotesCast: upload.data[
        "अनुपस्थित/स्थलांतरित/मृत मतदारांच्या यादीतील मतदान करणाऱ्याची एकूण संख्या"
      ]
        ? parseInt(
            upload.data[
              "अनुपस्थित/स्थलांतरित/मृत मतदारांच्या यादीतील मतदान करणाऱ्याची एकूण संख्या"
            ]
          )
        : null,
      violencePollInterruption:
        upload.data[
          "हिंसाचार किंवा कोणत्याही कारणास्तव मतदानात अडथळा आला अशी कोणतीही घटना (Y/N)"
        ],
      complaintsReceived:
        upload.data[
          "हिंसाचार किंवा कोणत्याही कारणास्तव मतदानात अडथळा आला अशी कोणतीही घटना (Y/N)"
        ],
      recommendataionOfRepoll: null,
      countOfVotesFromEDC: upload.data["EDC द्वारे झालेले मतदान"]
        ? parseInt(upload.data["EDC द्वारे झालेले मतदान"])
        : null,
      complaintAboutEVM: upload.data.hasOwnProperty(
        "EVM बाबत गंभीर तक्रार प्राप्त झालेली होती का (Y/N)"
      )
        ? upload.data["EVM बाबत गंभीर तक्रार प्राप्त झालेली होती का (Y/N)"]
        : null,
    };
  } catch (e) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cannot extract properties"
    );
  }
  res.send(obj);
});

const isScrutinySubmitActive = catchAsync(async (req, res) => {
  const isScrutinySubmitActive = await userService.getScrutinySubmit(
    req.user._id
  );
  res.send({ isScrutinySubmitActive });
});

const getTotalVotedDifference = catchAsync(async (req, res) => {
  const constituencyNumber = req.user.constituencyNumber;
  if (!constituencyNumber && req.user.type !== "ro") {
    throw new ApiError(httpStatus.FORBIDDEN, "Cannot access");
  }
  const result = await scrutinyService.getTotalVotedDifference(
    constituencyNumber
  );
  const { _id, ...rest } = result;
  res.send({ ...rest });
});

module.exports = {
  createScrutiny,
  getScrutinys,
  getScrutiny,
  updateScrutiny,
  deleteScrutiny,
  getAbstrctReport,
  getScrutinyDataByImg,
  isScrutinySubmitActive,
  avgPollingPercent,
  getTotalVotedDifference,
  createScrutinyWithoutAuth,
};
