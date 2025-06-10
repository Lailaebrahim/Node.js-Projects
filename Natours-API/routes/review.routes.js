import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import * as authController from "../controllers/auth.controller.js";

const reviewRouter = express.Router({ mergeParams: true });


reviewRouter
    .route("/")
    .get(authController.protect, reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);


reviewRouter
    .route("/:id")
    .get(reviewController.getReviewById)
    .patch(reviewController.updateReview)
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        reviewController.deleteReview
    );

export default reviewRouter;
