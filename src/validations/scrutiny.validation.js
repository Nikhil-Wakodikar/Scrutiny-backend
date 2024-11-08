const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createScrutiny = {};

const createScrutinyWithoutAuth = {
  body: Joi.object().keys({
    file: Joi.string().required(),
    numberOfConstituency: Joi.number().required(),
    numberOfPollingStation: Joi.number().required(),
  }),
};

const getScrutinys = {
  query: Joi.object().keys({
    pollingAgents: Joi.number().integer(),
    complaintsReceived: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    tenderedVotes: Joi.number().integer(),
    votersUsedAlternateDoc: Joi.boolean(),
    numberOfConstituency: Joi.number(),
    complaintAboutEVM: Joi.boolean(),
    identifyAsASD: Joi.boolean(),
    avgPollingPercent: Joi.boolean(),
  }),
};

const getAbstrctReport = {
  query: Joi.object().keys({
    pollingAgents: Joi.number().integer(),
    complaintsReceived: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    tenderedVotes: Joi.boolean(),
    votersUsedAlternateDoc: Joi.boolean(),
    complaintAboutEVM: Joi.boolean(),
    identifyAsASD: Joi.boolean(),
  }),
};

const getScrutinyById = {
  params: Joi.object().keys({
    scrutinyId: Joi.string().custom(objectId),
  }),
};

const updateScrutiny = {};

const deleteScrutiny = {
  params: Joi.object().keys({
    scrutinyId: Joi.string().custom(objectId),
  }),
};

const isScrutinySubmitActive = {};

module.exports = {
  deleteScrutiny,
  getScrutinys,
  getScrutinyById,
  updateScrutiny,
  createScrutiny,
  getAbstrctReport,
  isScrutinySubmitActive,
  createScrutinyWithoutAuth,
};
