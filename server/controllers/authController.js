import User from "../models/User.js";
import {
    comparePassword,
    createAuthToken,
    hashPassword,
} from "../middleware/auth.js";
import env from "../config/env.js";

export async function login(req, res, next) {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isPasswordValid = await comparePassword(
            password,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = createAuthToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function seedAdmin(req, res, next) {
    try {
        const email = env.ADMIN_EMAIL.trim().toLowerCase();
        const password = env.ADMIN_PASSWORD;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Admin already exists",
            });
        }

        const passwordHash = await hashPassword(password);
        const adminUser = await User.create({
            email,
            passwordHash,
            role: "admin",
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            data: {
                id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    } catch (error) {
        return next(error);
    }
}
