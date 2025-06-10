import Review from "../models/review.model.js";
import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getAllReviews = catchAsync(async (req, res, next) => {

    const reviews = await Review.find(req.params.tourId ? { tour: req.params.tourId } : {});

    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

export const createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tour) {
        req.body.tour = req.params.tourId ? req.params.tourId : req.body.tour;
    }
    if (!req.body.user) {
        req.body.user = req.user.id;
    }

    const review = await Review.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            review
        },
    });
});

export const getReviewById = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) { return next(new AppError("No Review found with that ID", 404)); }
    res.status(200).json({
        status: "success",
        data: {
            review,
        },
    });
});

export const updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdANdUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) { return next(new AppError("No Review found with that ID", 404)); }
    res.ststus(200).json({
        status: "suceess",
        data: {
            review,
        },
    })
});

export const deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) { return next(new AppError("No review found with that ID", 404)); }
    res.status(204).json({
        status: "success",
        data: null,
    });
});