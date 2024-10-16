const httpStatus = require("http-status");
const { Scrutiny } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create an poll
 * @param {Object} scrutinyBody
 * @returns {Promise<Scrutiny>}
 */
const createScrutiny = async (scrutinyBody) => {
  return Scrutiny.create(scrutinyBody);
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
const queryScrutiny = async (filter, options) => {
  const scrutinys = await Scrutiny.paginate(filter, options);
  return scrutinys;
};

/**
 * Get Poll by id
 * @param {ObjectId} id
 * @returns {Promise<Poll>}
 */
const getScrutinyById = async (id) => {
  return Scrutiny.findById(id);
};

/**
 * Update Poll by id
 * @param {ObjectId} scrutinyId
 * @param {Object} updateBody
 * @returns {Promise<Poll>}
 */

const updateScrutinyById = async (scrutinyId, updateBody) => {
  const scrutiny = await getScrutinyById(scrutinyId);
  Object.assign(scrutiny, updateBody);
  await Scrutiny.save();
  return Scrutiny;
};

/**
 * Delete trip by id
 * @param {ObjectId} scrutinyId
 * @returns {Promise<Boolean>}
 */
const deleteScrutinyById = async (scrutinyId) => {
  await Scrutiny.deleteMany({ _id: scrutinyId });
  return true;
};

const getReport = async () => {
  const report = await Scrutiny.aggregate([
    {
      $match: { complaintsReceived: { $eq: true } },
    },
    {
      $project: {
        _id: 0,
        constituencyNumber: "$constituencyDetails.numberOfConstituency",
        constituencyName: "$constituencyDetails.nameOfConstituency",
        pollingStationNumber: "$pollingStationDetails.numberOfPollingStation",
        pollingStationName: "$pollingStationDetails.nameOfPollingStation",
      },
    },
  ]);

  return report;
};

const getAbstrctReport = async (matchQuery = {complaintsReceived: true,}) => {
  // let matchQuery = {complaintsReceived: true,}
  console.log(matchQuery);
  const report = await Scrutiny.aggregate([
    {
      $match: {
        ...matchQuery
      },
    },
    {
      $group: {
        _id: {
          numberOfConstituency: "$constituencyDetails.numberOfConstituency",
          nameOfConstituency: "$constituencyDetails.nameOfConstituency",
        },
        totalComplaints: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        constituencyNumber: "$_id.numberOfConstituency",
        constituencyName: "$_id.nameOfConstituency",
        totalComplaints: 1,
      },
    },
  ]);

  return report;
};

module.exports = {
  createScrutiny,
  queryScrutiny,
  getScrutinyById,
  updateScrutinyById,
  deleteScrutinyById,
  getReport,
  getAbstrctReport,
};
