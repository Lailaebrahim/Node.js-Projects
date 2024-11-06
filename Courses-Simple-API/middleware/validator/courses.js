const { checkSchema } = require('express-validator');


const validateCourseId = checkSchema({
    id: {
        in: ['params'],
        errorMessage: 'Course Id is required'
    }
});

const validatePaginationQuery = checkSchema({
    page: {
        in: ['query'],
        optional: true,
        isInt: true,
        toInt: true,
        errorMessage: 'Page must be an integer'
    },
    limit: {
        in: ['query'],
        optional: true,
        isInt: true,
        toInt: true,
        errorMessage: 'Limit must be an integer'
    }
});

const validateCourse = checkSchema({
    name: {
        in: ['body'],
        errorMessage: 'Course title is required',
        isString: true,
    },
    price: {
        in: ['body'],
        errorMessage: 'Course price is required',
        isNumeric: true,
    }
});

module.exports = { validateCourseId, validateCourse, validatePaginationQuery };