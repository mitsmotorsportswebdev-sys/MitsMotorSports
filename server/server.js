import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-origin" },
}));

app.use(cors({
    origin: [env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});

app.use(["/api/admin/login", "/api/admin/seed-admin"], authLimiter);
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
    try {
        await connectDatabase();
        app.listen(env.PORT, () => {
            console.info(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error.message);
        process.exit(1);
    }
}

startServer();

export default app;
