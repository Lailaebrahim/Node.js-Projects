import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    photo: String,
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must have more than or equal to 8 characters"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords don't match"
        }
    }
});

// encrypting the password before saving it to the database
// note trhis only runs on calling model.save() method 
// so when we update the user's data using findByIdAndUpdate() method, this middleware won't run
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = undefined;
        next();
    }
});

const User = mongoose.model('User', userSchema);
export default User;