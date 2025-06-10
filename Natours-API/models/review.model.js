import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: [true, "A review must have a rating"],
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: [true, "A review must have a review text"],
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, "A review must belong to a tour"],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "A review must belong to a user"],
        },
    },
    {
        // this will force add all the virtual properties to the output even if they are not defined in the fields selected in the query
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate([
        { path: "user", select: "name photo" },
        // { path: "tour", select: "name" },
    ]);
    next();
});

const Review = model("Review", reviewSchema);
export default Review;
