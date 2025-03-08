import Tour from "../models/tour.model.js";
import APIFeatures from "../utils/apiFeatures.js";

export const aliasTopFiveCheapTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "-ratingAverage,price";
    req.query.fields = "name,price,ratingAverage,summary,difficulty";
    next();
};

export const getAllTours = async (req, res) => {
    try {
        // create features object calling the features this endpoint will provide
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        // get the query from the features object
        const query = features.query;
        console.log(query.options);
        // execute query
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

export const getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {
                    _id: { $ne: null },
                },
            },
            {
                $group: {
                    _id: { $toUpper: "$difficulty" },
                    numTours: { $sum: 1 },
                    avgRating: { $avg: "$ratingAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                }
            },
            {
                $sort: { avgPrice: 1 },
            }
        ]);
        res.status(200).json({
            status: "success",
            data: {
                stats,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message,
        });
    }
};

export const getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                // separate the startDates array into individual documents
                $unwind: "$startDates"
            },
            {
                // match all the tours in the year requested
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                // group by month and count the number of tours in each month and push the name of the tours in an array
                $group: {
                    _id: { $month: "$startDates" },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: "$name" }
                }
            },
            {
                // to view number of month saved in _id in a new field called month
                $addFields: { month: "$_id" }
            },
            {
                // project to exclude the id field
                $project: {
                    _id: 0
                }
            },
            {
                // sort the months in descending order
                $sort: { numTourStarts: -1 }
            }
        ]);

        res.status(200).json({
            status: "success",
            data: {
                plan,
            },
        });

    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message
        });
    }
};