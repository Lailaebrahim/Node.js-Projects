const monogoose = require('mongoose');


const courseSchema = new monogoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    price :{
        type: Number,
        required: true,
        min: 0,
    }
});

const Course = monogoose.model('Course', courseSchema);
module.exports.Course = Course;