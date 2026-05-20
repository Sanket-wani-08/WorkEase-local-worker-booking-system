import mongoose from "mongoose";
import "dotenv/config";
import Worker from "../models/Worker.js";
import { subcategoryPrices } from "../config/prices.js";

const updatePrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");

    const workers = await Worker.find({});
    console.log(`Found ${workers.length} workers`);

    for (const worker of workers) {
      const price = subcategoryPrices[worker.subcategory];
      await Worker.findByIdAndUpdate(worker._id, {
        price: price,
        priceUnit: "per service"
      }, { runValidators: false });
      console.log(`Updated ${worker.name} (${worker.subcategory}) -> ₹${price}`);
    }

    console.log("All workers updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error updating prices:", error);
    process.exit(1);
  }
};

updatePrices();
