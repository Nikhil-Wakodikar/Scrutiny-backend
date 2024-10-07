const Joi = require("joi");

const getCities = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    name: Joi.string(),
    countryCode: Joi.string(),
  }),
};

module.exports = { getCities };
