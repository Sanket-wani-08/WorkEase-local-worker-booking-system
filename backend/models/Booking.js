import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: false,
        index: true
    },

    isBroadcast: {
        type: Boolean,  
        default: false
    },

    category: {
        type: String,
        trim: true
    },

    service: {
        type: String,
        required: true,
        trim: true
    },

    bookingDate: {
        type: Date,
        required: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\d{10}$/.test(v),
            message: "Phone must be 10 digits"
        }
    },

    status: {
        type: String,
        enum: ["Pending", "Accepted", "Completed", "Cancelled"],
        default: "Pending",
        index: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
    },

    amount: {
        type: Number,
        required: true,
        min: [0, "Amount must be positive"]
    },

    razorpayOrderId: {
        type: String,
        index: true
    },

    razorpayPaymentId: {
        type: String
    },

    workerLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },

    userLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [72.5714, 23.0225] // [lng, lat] for Ahmedabad
        }
    },
    platformFee: { type: Number, default: 0 },
    workerEarnings: { type: Number, default: 0 },
    isReviewed: { type: Boolean, default: false }

}, { timestamps: true });


//GEO INDEX 
bookingSchema.index({ workerLocation: "2dsphere" });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;