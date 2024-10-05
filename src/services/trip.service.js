const httpStatus = require("http-status");
const { Trip } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create an trip
 * @param {Object} tripBody
 * @returns {Promise<Trip>}
 */
const createTrip = async (tripBody) => {
  return Trip.create(tripBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTrip = async (filter, options) => {
  const trips = await Trip.paginate(filter, options);
  return trips;
};

/**
 * Get trip by id
 * @param {ObjectId} id
 * @returns {Promise<Trip>}
 */
const getTripById = async (id) => {
  return Trip.findById(id);
};

/**
 * Update trip by id
 * @param {ObjectId} tripId
 * @param {Object} updateBody
 * @returns {Promise<Trip>}
 */

const updateTripById = async (tripId, updateBody) => {
  const trip = await getTripById(tripId);
  Object.assign(trip, updateBody);
  await trip.save();
  return trip;
};

/**
 * Delete trip by id
 * @param {ObjectId} tripId
 * @returns {Promise<Boolean>}
 */
const deleteTripById = async (tripId) => {
  await Trip.deleteMany({ _id: tripId });
  return true;
};

module.exports = {
  createTrip,
  queryTrip,
  getTripById,
  updateTripById,
  deleteTripById,
};
