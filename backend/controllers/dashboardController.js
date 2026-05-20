import User from "../models/User.js";
import Worker from "../models/Worker.js";
import Booking from "../models/Booking.js";


// basic stats (admin)
export const getDashboardStats = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const totalUsers = await User.countDocuments();
        const totalWorkers = await Worker.countDocuments({ isVerified: true });
        const totalBookings = await Booking.countDocuments();

        const completedBookings = await Booking.countDocuments({
            status: "Completed"
        });

        const pendingBookings = await Booking.countDocuments({
            status: "Pending"
        });

        const cancelledBookings = await Booking.countDocuments({
            status: "Cancelled"
        });

        res.json({
            totalUsers,
            totalWorkers,
            totalBookings,
            completedBookings,
            pendingBookings,
            cancelledBookings
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// advanced stats - (admin)
export const getAdvancedStats = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" }, totalCommission: { $sum: "$platformFee" } } }
        ]);

        const bookingsByStatus = await Booking.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.json({
            totalRevenue: revenueResult[0]?.total || 0,
            totalCommission: revenueResult[0]?.totalCommission || 0,
            bookingsByStatus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};