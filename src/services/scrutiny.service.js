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
  await scrutiny.save();
  return scrutiny;
};

/**
 * Delete scrutiny by id
 * @param {ObjectId} scrutinyId
 * @returns {Promise<Boolean>}
 */
const deleteScrutinyById = async (scrutinyId) => {
  await Scrutiny.deleteOne({ _id: scrutinyId });
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

const findGlobalAvgVoting = async (constituencyNumber) => {
  const pipeline = [
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          numberOfConstituency: constituencyNumber,
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "polingStations",
          localField: "numberOfPollingStation",
          foreignField: "numberOfPollingStation",
          as: "polingstationDetails",
        },
    },
    {
      $unwind:
        /**
         * path: Path to the array field.
         * includeArrayIndex: Optional name for index.
         * preserveNullAndEmptyArrays: Optional
         *   toggle to unwind null and empty values.
         */
        {
          path: "$polingstationDetails",
          preserveNullAndEmptyArrays: true,
        },
    },
    {
      $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
          votingPercent: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      "$personsVoted.total",
                      "$polingstationDetails.electorsCount",
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: null,
          avgRatio: {
            $avg: "$votingPercent",
          },
          electorsCount: {
            $first: "$polingstationDetails.electorsCount",
          },
          numberOfConstituency: {
            $first: "$numberOfConstituency",
          },
          nameOfConstituency: {
            $first: "$nameOfConstituency",
          },
        },
    },
  ];
  return (await Scrutiny.aggregate(pipeline))[0];
};

const find15percentLimit = async (
  constituencyNumber,
  upperLimit,
  lowerLimit,
  electorCount
) => {
  const pipeline = [
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          numberOfConstituency: constituencyNumber,
        },
    },
    {
      $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
          votingPercent: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$personsVoted.total", electorCount],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
    },
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          $or: [
            {
              votingPercent: {
                $lt: lowerLimit,
              },
            },
            {
              votingPercent: {
                $gt: upperLimit,
              },
            },
          ],
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: null,
          count: {
            $sum: 1,
          },
          results: {
            $push: "$$ROOT",
          },
        },
    },
  ];
  return (await Scrutiny.aggregate(pipeline))[0];
};

module.exports = {
  createScrutiny,
  queryScrutiny,
  getScrutinyById,
  updateScrutinyById,
  deleteScrutinyById,
  getAbstrctReport,
  findGlobalAvgVoting,
  find15percentLimit,
};
