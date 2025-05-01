export default class APIFeatures {
    private queryString: any;
    public query: any;

    constructor(queryString: any) {
        this.queryString = queryString;
        this.query = {};
    }

    filter() {
        const queryObj = { ...this.queryString };
        this.query.where = {};

        // this is not general this is specific to the book resource
        // need to be generalized
        if (queryObj.search) {
            this.query.where = {
                title: {
                    contains: queryObj.search
                }
            };
        }

        const filterMethods = ["page", "sort", "limit", "select", "offset", "search"];
        filterMethods.forEach((el) => delete queryObj[el]);

        if (queryObj.year) queryObj.year = Number(queryObj.year);
        if (queryObj.authorId) queryObj.authorId = Number(queryObj.authorId);

        this.query.where = {
            ...this.query.where,
            ...queryObj
        };

        return this;
    };

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",");

            if(sortBy.length > 0) {
                this.query.orderBy = [];
                sortBy.forEach((el: string) => {
                    if (el.startsWith("-")) {
                        el = el.substring(1);
                        this.query.orderBy.push({
                            [el]: "desc",
                        });
                    } else {
                        this.query.orderBy.push({
                            [el]: "asc",
                        });
                    }
                });
            }
        }

        return this;
    };

    selectFields() {
        if (this.queryString.select) {
            const select = this.queryString.select.split(',');

            if(select.length > 0) {
                this.query.select = {};
                select.forEach((el: string) => {
                    this.query.select[el] = true;
                });
            }
        }

        return this;
    };

    paginate() {
        const page = Number(this.queryString.page);
        const limit = Number(this.queryString.limit);
        const offset = Number(this.queryString.offset);

        if(page && limit) {
            const skip = (page - 1) * limit;

            this.query.skip = skip;
            this.query.take = limit;
        } else if (offset && limit) {
            this.query.skip = offset;
            this.query.take = limit;
        } else if (limit) {
            this.query.skip = 0;
            this.query.take = limit;
        } else if (page) {
            this.query.skip = (page - 1) * 10;
            this.query.take = 10;
        } else{
            this.query.skip = 0;
            this.query.take = 10;
        }

        return this;
    };
}