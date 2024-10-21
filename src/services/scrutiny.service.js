const httpStatus = require("http-status");
const { Scrutiny } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create an poll
 * @param {Object} scrutinyBody
 * @returns {Promise<Scrutiny>}
 */
const createScrutiny = async (scrutinyBody) => {
  try {
    return Scrutiny.create(scrutinyBody);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "DB error");
  }
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
 * Get scrutiny by id
 * @param {ObjectId} id
 * @returns {Promise<Scrutiny>}
 */
const getScrutinyById = async (id) => {
  return Scrutiny.findById(id);
};

/**
 * Update scrutiny by id
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
 * Delete scrutiny by id
 * @param {ObjectId} scrutinyId
 * @returns {Promise<Boolean>}
 */
const deleteScrutinyById = async (scrutinyId) => {
  await Scrutiny.deleteMany({ _id: scrutinyId });
  return true;
};

const getAbstrctReport = async (matchQuery) => {
  const report = await Scrutiny.aggregate([
    {
      $match: {
        ...matchQuery,
      },
    },
    {
      $group: {
        _id: {
          numberOfConstituency: "$numberOfConstituency",
          nameOfConstituency: "$nameOfConstituency",
        },
        totalComplaints: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        numberOfConstituency: "$_id.numberOfConstituency",
        nameOfConstituency: "$_id.nameOfConstituency",
        count: "$totalComplaints",
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
  getAbstrctReport,
};
