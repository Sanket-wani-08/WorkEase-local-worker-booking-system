import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { conn } from "./config/conn.js";
import http from "http";
import { Server } from "socket.io";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { seedCategories } from "./controllers/categoryController.js";
import { saveMessage } from "./controllers/messageController.js";

const app = express();
const port = process.env.PORT || 4000;


// MIDDLEWARE 
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));


// ROUTES 
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/workers", workerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", notificationRoutes);
app.use("/categories", categoryRoutes);
app.use("/messages", messageRoutes);


app.get("/", (req, res) => {
    res.send("🚀 WorkEase API Running");
});


// 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


//ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong",
        error: err.message
    });
});


// SOCKET.IO & SERVER SETUP
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"]
    }
});

// runs when user connects to socket.io
io.on("connection", (socket) => {
    socket.on("join-booking", (bookingId) => {
        if (!bookingId) return;
        socket.join(bookingId);
    });

    socket.on("send-location", ({ bookingId, lat, lng }) => {
        if (!bookingId || lat === undefined || lng === undefined) return;
        io.to(bookingId).emit("receive-location", { lat, lng });
    });

    socket.on("send-message", async ({ bookingId, sender, senderModel, content }) => {
        if (!bookingId || !sender || !content) return;
        
        // Save message to DB
        const savedMsg = await saveMessage(bookingId, sender, senderModel, content);
        if (savedMsg) {
            // Broadcast to all in the booking room
            io.to(bookingId).emit("receive-message", savedMsg);
        }
    });

    socket.on("update-status", ({ bookingId, status }) => {
        if (!bookingId || !status) return;
        io.to(bookingId).emit("status-updated", { status });
    });

    socket.on("disconnect", () => {
    });
});

// START SERVER
const startServer = async () => {
    try {
        await conn();
        console.log("🚀 Database connected");
        
        await seedCategories();
        
        server.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1); // Exit if DB connection fails
    }
};

startServer();
