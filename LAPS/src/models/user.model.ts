import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [100, 'Name Length should be less than or equal to 100 characters'] 
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Invalid Email !"]
    },
    photo: String,
    password:{
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    confirmPassword:{
        type: String,
        required: true,
        validate:{
            validator: function(el: string) {
                return el === (this as any).password;
            },
            message: "Password Not Confirmed!"
        },
        select: false
    },
    passwordChangeAt: Date,
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

userSchema.pre('save', async function (next){
    if(!this.isModified('password')) return next();
    const hashedPassword = await bcrypt.hash(this.password, Number(process.env.salt));
    this.password = hashedPassword;
    next();
});

userSchema.methods.validatePassword = async function (candidatePassword: string) {
   return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
    if (!this.passwordChangeAt) return false;

    const passwordChangeTimestamp = this.passwordChangeAt.getTime() / 1000;
    return JWTTimestamp < passwordChangeTimestamp;
};


const User = mongoose.model('User', userSchema);
export default User;