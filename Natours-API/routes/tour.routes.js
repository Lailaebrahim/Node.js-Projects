import express from "express";
import * as tourController from "../controllers/tour.controller.js";
import * as authController from "../controllers/auth.controller.js";

const tourRouter = express.Router();

tourRouter
    .route("/top-5-cheap")
    .get(tourController.aliasTopFiveCheapTours, tourController.getAllTours);

tourRouter.route("/tour-stats").get(tourController.getTourStats);

tourRouter.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

tourRouter
    .route("/")
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

tourRouter
    .route("/:id")
    .get(tourController.getTourById)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour
    );

export default tourRouter;
