import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({

    profileImage: {
        type: String,
        default: "",
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, "Invalid phone number"],
        index: true
    },

    category: {
        type: String,
        required: true,
        index: true
    },

    subcategory: {
        type: String,
        required: true,
        index: true
    },

    experience: {
        type: Number,
        min: 0,
        default: 0
    },

    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },

    aadhaarNumber: {
        type: String,
        required: true,
        match: [/^\d{12}$/, "Invalid Aadhaar number"]
    },


    aadhaarImage: {
        type: String,
        default: "",
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    rejectionReason: {
        type: String,
        default: ""
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        default: 500,
        min: 0
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
        select: false, // Hide by default
        default: "none"
    }

}, { timestamps: true });


//  GEO INDEX
workerSchema.index({ location: "2dsphere" });


//HIDE PASSWORD
workerSchema.methods.toJSON = function () {
    const worker = this.toObject();
    delete worker.password;
    return worker;
};


const Worker = mongoose.model("Worker", workerSchema);

export default Worker;