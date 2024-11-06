const { Course } = require("../models/course");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const appError = require("../utils/error");

const getAllCourses = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(new appError().createError(400, result.array()));
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: 0 }).limit(limit).skip(skip);
  res.jsend.success(courses);
});

const getCourseById = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(new appError().createError(400, result.array()));
  const course = await Course.findById(req.params.id, { __v: 0 });
  if (!course)
    return next(
      new appError().createError(
        404,
        "The course with the given ID was not found"
      )
    );
  res.jsend.success(course);
});

const postCourse = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(new appError().createError(400, result.array()));
  const course = new Course({ ...req.body });
  await course.save();
  res.jsend.success(course);
});

const putCourse = asyncHandler(async (req, res, next) => {
  /*{ new: true } is an options object.
    new: true ensures that the method returns the updated document rather than the original. */
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(new appError().createError(400, result.array()));
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  if (!course)
    return next(
      new appError().createError(
        404,
        "The course with the given ID was not found"
      )
    );
  res.jsend.success(course);
});

const deleteCourse = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return next(new appError().createError(400, result.array()));
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course)
    return next(
      new appError().createError(
        404,
        "The course with the given ID was not found"
      )
    );
  res.jsend.success(null);
});

module.exports = {
  getAllCourses,
  getCourseById,
  postCourse,
  putCourse,
  deleteCourse,
};
