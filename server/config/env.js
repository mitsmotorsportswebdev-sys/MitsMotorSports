import dotenv from "dotenv";

dotenv.config();

const env = {
    PORT: Number(process.env.PORT || 5000),
    MONGODB_URI: process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/mits-motorsports",
    JWT_SECRET: process.env.JWT_SECRET ||
        "development-secret-do-not-use-in-production",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
    NODE_ENV: process.env.NODE_ENV || "development",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@mitsmotorsports.local",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "ChangeMe123!",
};

export default env;
