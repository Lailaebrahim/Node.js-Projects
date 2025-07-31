import { Query } from 'mongoose';
import Laptop from '../models/laptop.model.js';


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

      // converting query parameters to MongoDB operators
      let queryString = JSON.stringify(queryObject);
      queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match: string) => `$${match}`
      );

      this.query = Laptop.find(JSON.parse(queryString));

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
        const page = this.queryString.page ? parseInt(this.queryString.page as string) : 1;
        const limit = this.queryString.limit ? parseInt(this.queryString.limit as string) : 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}
export default APIFeatures;