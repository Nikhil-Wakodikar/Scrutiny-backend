const cities = require("../../cities.json");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

function searchByNameAndCountryWithPagination(options, page = 1, limit = 10) {
  const { name, countryCode } = options;
  // Filter by both name and country_code
  console.log(page, limit, "Options");
  const filteredData = cities.filter(
    (item) =>
      item.name.toLowerCase().includes(name.toLowerCase()) &&
      item.country_code.toLowerCase() === countryCode.toLowerCase()
  );

  if (!filteredData.length) {
    return {
      currentPage: 1,
      totalPages: 1,
      data: [],
      totalResults: 0,
    };
  }

  // Pagination logic
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    currentPage: page,
    totalPages: Math.ceil(filteredData.length / limit),
    data: paginatedData,
    totalResults: filteredData.length,
  };
}

module.exports = { searchByNameAndCountryWithPagination };
