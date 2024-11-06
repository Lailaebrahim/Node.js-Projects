const express = require("express");
const router = express.Router();
const { Course } = require("../models/course");
const checkAuth = require("../middleware/auth/checkAuth");
const {
  getAllCourses,
  getCourseById,
  postCourse,
  putCourse,
  deleteCourse,
} = require("../controller/courses");
const {
  validateCourseId,
  validateCourse,
  validatePaginationQuery,
} = require("../middleware/validator/courses");
const allowedTo = require("../middleware/auth/checkRole");
const userRoles = require("../utils/userRoles");

router
  .route("/")
  .get(validatePaginationQuery, getAllCourses)
  .post(checkAuth, allowedTo(userRoles.ADMIN), validateCourse, postCourse);

router
  .route("/:id")
  .get(validateCourseId, getCourseById)
  .put(checkAuth, allowedTo(userRoles.ADMIN), validateCourseId, putCourse)
  .delete(checkAuth, allowedTo(userRoles.ADMIN), validateCourseId, deleteCourse);

module.exports = router;
