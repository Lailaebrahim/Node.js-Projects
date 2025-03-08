/**
 * @module apiFeatures
 * @description Provides API query features such as filtering, sorting, field limiting, and pagination
 */

/**
 * Class for handling API query features
 * @class APIFeatures
 */

/**
 * Creates a new APIFeatures instance
 * @constructor
 * @param {Object} query - The Mongoose query object
 * @param {Object} queryString - The query parameters from the request
 */

/**
 * Filters the query based on query parameters
 * @method filter
 * @description Removes special query parameters and handles advanced filtering with operators (gte, gt, lt, lte)
 * @returns {APIFeatures} Returns this for method chaining
 */

/**
 * Sorts the results based on sort parameter
 * @method sort
 * @description Sorts by specified fields or defaults to newest first (-createdAt)
 * @returns {APIFeatures} Returns this for method chaining
 */

/**
 * Limits the fields returned in the query results
 * @method limitFields
 * @description Selects only specified fields or excludes the '__v' field by default
 * @returns {APIFeatures} Returns this for method chaining
 */

/**
 * Implements pagination for the query results
 * @method paginate
 * @description Controls which subset of results to return based on page and limit parameters
 * @returns {APIFeatures} Returns this for method chaining
 */
export default class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // Build query 
        const queryObj = { ...this.queryString };
        const filterMethods = ["page", "sort", "limit", "fields"];
        filterMethods.forEach((el) => delete queryObj[el]);

        // Advanced filtering to allow for greater than, less than, etc
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    };

    sort() {
        // Sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    };

    limitFields() {
        // selecting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    };

    paginate() {
        // pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    };
}