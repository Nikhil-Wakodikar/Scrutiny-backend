const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createTrip = {
  body: Joi.object().keys({
    destinations: Joi.array().items(Joi.string()).min(1).required(),
    startDate: Joi.date().required(),
    startLocations: Joi.array().items(Joi.string()).min(1).required(),
    duration: Joi.object()
      .keys({
        days: Joi.number().required(),
        nights: Joi.number().required(),
      })
      .required(),
    pkgInclude: Joi.array().items(Joi.string()),
    contactPerson: Joi.object()
      .keys({
        name: Joi.string().required(),
        phone: Joi.object().keys({
          countryCode: Joi.number().required(),
          number: Joi.number().required(),
        }),
        email: Joi.string().email(),
      })
      .min(2)
      .required(),
    totalSeatsAvailable: Joi.number(),
    clickableLink: Joi.string().required(),
    cost: Joi.number().required(),
    otherDetails: Joi.string(),
  }),
};

const getTrips = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = { createTrip, getTrips };
