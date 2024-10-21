const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { private, paginate, softDelete } = require("./plugins");
const { roles } = require("../config/roles");

const votesAccount = mongoose.Schema(
  {
    numberOfConstituency: { type: Number },
    nameOfConstituency: { type: String },
    numberOfPollingStation: { type: Number },
    nameOfPollingStation: { type: String },
    buCuVvpatUsed: {
      ballotUnit: { type: Number, default: null },
      controlUnit: { type: Number, default: null },
      vvpat: { type: Number, default: null },
    },
    countOfElectorsAssigned: { type: Number },
    countOfRegistorForVoters: { type: Number },
    countOfNotToVote: { type: Number },
    countOfNotAllowedToVote: { type: Number },
    countOfVotesToDeduct: { type: Number },
    testVotesCast: {
      srNo: { type: Number },
      nameOfCandidate: { type: String },
      numberOfVotes: { type: Number },
    },
    countOfVotesRecordedAsVotingMachine: { type: Number },
    discrepancyNotice: { type: Boolean },
    countOfVoterUsedTenderedBallotPapers: { type: Number },
    vallotPapers: {
      receivedForUse: { type: Number },
      issuedToElectors: { type: Number },
      unUsedAndReturned: { type: Number },
    },
    accountOfPapersSealsIssued: {
      count: { type: Number },
      from: { type: Number },
      to: { type: Number },
    },
    accountOfPapersSealsUsed: {
      count: { type: Number },
      from: { type: Number },
      to: { type: Number },
    },
    accountOfPapersSealsReturned: {
      count: { type: Number },
      from: { type: Number },
      to: { type: Number },
    },
    accountOfPapersSealsDamaged: {
      count: { type: Number },
      from: { type: Number },
      to: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

votesAccount.plugin(paginate);

/**
 * @typedef User
 */
const VotesAccount = mongoose.model(
  "VotesAccount",
  votesAccount,
  "votesAccounts"
);

module.exports = VotesAccount;
