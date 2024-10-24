const mongoose = require("mongoose");
const { Schema } = mongoose;
const { private, paginate, softDelete } = require("./plugins");

const scrutinySchema = new Schema(
  {
    numberOfConstituency: { type: Number },
    nameOfConstituency: { type: String },
    numberOfPollingStation: { type: Number },
    nameOfPollingStation: { type: String },
    totalElectors: {
      male: { type: Number, default: null },
      female: { type: Number, default: null },
      tg: { type: Number, default: null },
      total: { type: Number, default: null },
    },
    personsVoted: {
      male: { type: Number, default: null },
      female: { type: Number, default: null },
      tg: { type: Number, default: null },
      total: { type: Number, default: null },
    },
    tenderedVotes: { type: Number, default: null },
    challengedVotes: { type: Number, default: null },
    proxyVotesByCSVs: { type: Number, default: null },
    votersEPIC: { type: Number, default: null },
    votersAlternativeDocument: { type: Number, default: null },
    votersRule49O: { type: Number, default: null },
    pollingAgents: { type: Number, default: null },
    overseasElectors: { type: Number, default: null },
    buCuVvpatUsed: {
      ballotUnit: { type: Number, default: null },
      controlUnit: { type: Number, default: null },
      vvpat: { type: Number, default: null },
    },

    buCuVvpatChanged: {
      isBallotUnit: { type: Boolean, default: null },
      isControlUnit: { type: Boolean, default: null },
      isVvpat: { type: Boolean, default: null },
    },
    changeTimeReason: { type: String, default: null },
    totalAsdVoters: { type: Number, default: null },
    totalAsdVotesCast: { type: Number, default: null },
    violencePollInterruption: { type: Boolean, default: false },
    complaintsReceived: { type: Boolean, default: null },
    countOfVotesFromEDC: { type: Number, default: null },
    complaintAboutEVM: { type: Boolean, default: false },
    reasonForRepoll: { type: String, default: null }, // Added conditionally
    reasonForPollInterruption: { type: String, default: null }, // Added conditionally
  },
  { timestamps: true }
);

scrutinySchema.plugin(paginate);

/**
 * @typedef Token
 */
const Scrutiny = mongoose.model("scrutiny", scrutinySchema);

module.exports = Scrutiny;
