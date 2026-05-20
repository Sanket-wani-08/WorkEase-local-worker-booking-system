import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";


// get user profile
export const getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// update user profile
export const updateUserProfile = async (req, res) => {
    try {

        const { name, email, phone, password } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (phone && phone.length !== 10) {
            return res.status(400).json({ message: "Invalid phone number" });
        }

        // check email uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // check phone uniqueness
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(400).json({ message: "Phone already in use" });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters"
                });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        // upload profile image if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            user.profileImage = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};