const httpStatus = require("http-status");
const { VotesAccount } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create an votesAccount
 * @param {Object} votesAccountBody
 * @returns {Promise<VotesAccount>}
 */
const createVotesAccount = async (votesAccountBody) => {
  try {
    return VotesAccount.create(votesAccountBody);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, "DB error");
  }
};

/**
 * Query for votesAccount
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVotesAccount = async (filter, options) => {
  const votesAccounts = await VotesAccount.paginate(filter, options);
  return votesAccounts;
};

/**
 * Get VotesAccount by id
 * @param {ObjectId} id
 * @returns {Promise<VotesAccount>}
 */
const getVotesAccountById = async (id) => {
  return VotesAccount.findById(id);
};

/**
 * Update scrutiny by id
 * @param {ObjectId} votesAccountId
 * @param {Object} updateBody
 * @returns {Promise<VotesAccount>}
 */

const updateVotesAccountById = async (votesAccountId, updateBody) => {
  const votesAccount = await getVotesAccountById(votesAccountId);
  Object.assign(votesAccount, updateBody);
  await votesAccount.save();
  return votesAccount;
};

module.exports = {
  createVotesAccount,
  queryVotesAccount,
  getVotesAccountById,
  updateVotesAccountById,
};
