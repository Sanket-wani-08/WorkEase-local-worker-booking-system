import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
        index: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, "Invalid phone number"],
        index: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false 
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    isActive: {
        type: Boolean,
        default: true
    },
    
    profileImage: {
        type: String,
        default: ""
    },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    securityQuestion: {
        type: String,
        required: true,
        default: "What is your pet's name?"
    },
    securityAnswer: {
        type: String,
        required: true,
        select: false,
        default: "none"
    }

}, { timestamps: true });


//HIDE PASSWORD IN RESPONSE
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};


const User = mongoose.model("User", userSchema);

export default User;