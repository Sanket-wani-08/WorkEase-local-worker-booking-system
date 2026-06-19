import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["1.1.1.1"]);

export const conn = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
};