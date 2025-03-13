import { Schema, model } from "mongoose";

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        maxlength: [40, 'Tour name must have less than or equal to 40 characters'],
        minlength: [10, 'Tour must have more than or equal to 10 characters']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'meduim', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: "The discount price ({VALUE}) should be below the regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        // to exclude this field from the output
        select: false
    },
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    // this will force add all the virtual properties to the output even if they are not defined in the fields selected in the query
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// document middleware
// runs before .save() and .create() but not on .insertMany() and .update()
tourSchema.pre('save', function (next) {
    this.slug = this.name.split(' ').join('-');
    next();
})

// post save hook/middleware
// tourSchema.post('save', function (doc, next) {
//     // console.log(doc);
//     next();
// })

// query middleware

// pre find hook/middleware - using regex to match all the find methods
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    // this.start = Date.now();
    next();
})

// post find hook/middleware
// tourSchema.post(/^find/, function (docs, next) {
//     // console.log(`Query took ${Date.now() - this.start} milliseconds`);
//     // console.log(docs);
//     next();
// });

// aggregation middleware
// It runs before any aggregation pipeline is executed on the Tour model.
tourSchema.pre('aggregate', function (next) {
    // this here refers to the aggregation object
    // The pipeline() method returns the array of stages in the current aggregation pipeline.
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
})

const Tour = model("Tour", tourSchema);
export default Tour;