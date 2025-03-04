import Tour from "../models/tour.model.js";


export const getAllTours = async (req, res) => {
    try {
        // Build query 
        const queryObj = { ...req.query };
        const filterMethods = ["page", "sort", "limit", "fields"];
        filterMethods.forEach((el) => delete queryObj[el]);
        // create query object
        // query object is an object that inherits from the  query object prototype
        // so we can chain methods on it like find, sort, limit, etc
        // once we use await or exec, the query object will be executed
        // amd the return is an array of documents that match the query
        const query = Tour.find(queryObj);
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
            message: error,
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
