import mongoose from "mongoose";
import "dotenv/config";

const mongo_url = process.env.MONGO_URL;

export const conn = async () => {
    try {
        await mongoose.connect(mongo_url, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Mongodb Connected Successfully");

    } catch (err) {
        console.error("❌ Mongodb connection failed:", err.message);
        throw err;
    }
};