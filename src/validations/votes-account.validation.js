const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createVotesAccount = {};

const getVotesAccounts = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getVotesAccountById = {
  params: Joi.object().keys({
    votesAccountId: Joi.string().custom(objectId),
  }),
};

const updateVotesAccount = {};

module.exports = {
  createVotesAccount,
  getVotesAccounts,
  getVotesAccountById,
  updateVotesAccount,
};
