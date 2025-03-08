import Tour from "../models/tour.model.js";

export const aliasTopFiveCheapTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingAverage,price";
    req.query.fields = "name,price,ratingAverage,summary,difficulty";
    next();
};

export const getAllTours = async (req, res) => {
    try {
        // Build query 
        const queryObj = { ...req.query };
        const filterMethods = ["page", "sort", "limit", "fields"];
        filterMethods.forEach((el) => delete queryObj[el]);

        // Advanced filtering to allow for greater than, less than, etc
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);

        // create query object
        // query object is an object that inherits from the  query object prototype
        // so we can chain methods on it like find, sort, limit, etc
        // once we use await or exec, the query object will be executed
        // and the return is an array of documents that match the query
        let query = Tour.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // selecting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const toursCount = await Tour.countDocuments();
            if (skip >= toursCount) throw new Error('This page does not exist');
        }

        // Execute query
        const tours = await query;

        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message,
        });
    }
};

export const createTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                tour
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
};

export const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error,
        });
    }
};

// findyByIdAndUpdate find by if then update only the passed values in the body
// findByIdAndReplace find by id and replace the whole object with the new object
// so we use findByIdAndUpdate with patch request as put request will replace the whole object
export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdANdUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.ststus(200).json({
            status: "suceess",
            data: {
                tour,
            },
        })

    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error,
        });
    }
};

export const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error,
        });
    }
};
