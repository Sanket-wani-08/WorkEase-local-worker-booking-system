import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

console.log("☁️  Cloudinary Configured:", {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY ? "EXISTS" : "MISSING",
    api_secret: process.env.CLOUD_API_SECRET ? "EXISTS" : "MISSING"
});

export default cloudinary;