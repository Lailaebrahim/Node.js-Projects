import { Query } from "mongoose";
import Laptop from "../models/laptop.model.js";

class APIFeatures {
  public query: Query<any, any>;
  private queryString: any;

  constructor(query: Query<any, any>, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };
    // removing fields that are not used for filtering
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((field: any) => delete queryObject[field]);

    // transform query ex: from price[gte]=500 to { price: { $gte: 500 } }
    const transformedQuery: any = {};

    Object.keys(queryObject).forEach((key) => {
        // check for square bracket notation for operators
      const operatorMatch = key.match(/^(\w+)\[(\w+)\]$/);

      if (operatorMatch) {
        const [, fieldName, operator] = operatorMatch;

        // if filter field does not exist in transformedQuery, initialize it
        if (!transformedQuery[fieldName]) {
          transformedQuery[fieldName] = {};
        }

        // convert value to number if it's a numeric field
        let value = queryObject[key];
        const numericFields = [
          "price",
          "ram",
          "ssd",
          "hard_disk",
          "screen_size_inches",
          "no_of_cores",
          "no_of_threads",
          "spec_score",
        ];
        if (numericFields.includes(fieldName) && !isNaN(value)) {
          value = Number(value);
        }

        // assign the transformedQuery field with value
        transformedQuery[fieldName][`$${operator}`] = value;
      } else {
        // if no operator, just assign the value directly
        transformedQuery[key] = queryObject[key];
      }
    });

    this.query = this.query.find(transformedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-spec_score model_name");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page
      ? parseInt(this.queryString.page as string)
      : 1;
    const limit = this.queryString.limit
      ? parseInt(this.queryString.limit as string)
      : 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
export default APIFeatures;
