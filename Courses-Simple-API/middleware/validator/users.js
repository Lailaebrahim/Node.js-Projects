const {checkSchema} = require('express-validator');

const validateUser = checkSchema({
    firstName:{
        in : [ 'formData'],
        errorMessage: 'First Name is required',
        isString: true,
    },
    lastName:{
        in : [ 'formData'],
        errorMessage: 'Last Name is required',
        isString: true,
    },
    email:{
        in : [ 'formData'],
        errorMessage: 'Email is required',
        isEmail: true,
    },
    password:{
        in : [ 'formData'],
        errorMessage: 'Password is required',
        isString: true,
    }
});

const validateLogin = checkSchema({
    email:{
        in : [ 'formData'],
        errorMessage: 'Email is required',
        isEmail: true,
    },
    password:{
        in : [ 'formData'],
        errorMessage: 'Password is required',
        isString: true,
    }
});


module.exports = {validateUser, validateLogin};