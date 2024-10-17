const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createScrutiny = {};

const getScrutinys = {
  query: Joi.object().keys({
    pollingAgents: Joi.number().integer(),
    complaintsReceived: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAbstrctReport = {
  query: Joi.object().keys({
    pollingAgents: Joi.number().integer(),
    complaintsReceived: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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

module.exports = {
  deleteScrutiny,
  getScrutinys,
  getScrutinyById,
  updateScrutiny,
  createScrutiny,
  getAbstrctReport,
};
