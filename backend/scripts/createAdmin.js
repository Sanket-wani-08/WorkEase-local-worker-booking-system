import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        
        const email = "sanket@gmail.com";
        const password = "810204";
        
        
        await User.deleteOne({ email });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = new User({
            name: "Main Admin",
            email: email,
            password: hashedPassword,
            phone: "9999999999",
            role: "admin"
        });
        
        await admin.save();
        console.log(`✅ Admin account created!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
