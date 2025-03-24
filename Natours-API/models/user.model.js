import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
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

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (!this.passwordChangeAt) return false;

    const passwordChangeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000);
    return JWTTimestamp < passwordChangeTimestamp;
};

// generate token for password reset
// using crypto as the token doesn't supose a security risk so we don't need to use jwt
// but still it must be hashed before saving to the database
userSchema.methods.generateResetPasswordToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return token;
}

const User = mongoose.model('User', userSchema);
export default User;