import Tour from "../models/tour.model.js";
import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const aliasTopFiveCheapTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "-ratingAverage,price";
    req.query.fields = "name,price,ratingAverage,summary,difficulty";
    next();
};

export const getAllTours = catchAsync(async (req, res, next) => {
    // create features object calling the features this endpoint will provide
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    // get the query from the features object
    const query = features.query;
    // execute query
    const tours = await query;

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours,
        },
    });
});

export const createTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour
        },
    });
});

export const getTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) { return next(new AppError("No tour found with that ID", 404)); }
    res.status(200).json({
        status: "success",
        data: {
            tour,
        },
    });
});

// findyByIdAndUpdate find by if then update only the passed values in the body
// findByIdAndReplace find by id and replace the whole object with the new object
// so we use findByIdAndUpdate with patch request as put request will replace the whole object
export const updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdANdUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tour) { return next(new AppError("No tour found with that ID", 404)); }
    res.ststus(200).json({
        status: "suceess",
        data: {
            tour,
        },
    })
});

export const deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) { return next(new AppError("No tour found with that ID", 404)); }
    res.status(204).json({
        status: "success",
        data: null,
    });
});

export const getTourStats = catchAsync(async (req, res, next) => {
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
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});
