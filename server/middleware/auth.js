import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import env from "../config/env.js";

function getJwtSecret() {
    return process.env.JWT_SECRET || env.JWT_SECRET;
}

function getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || env.JWT_EXPIRES_IN;
}

export function createAuthToken(payload, expiresIn = getJwtExpiresIn()) {
    return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
    if (!token) {
        throw new Error("Missing token");
    }

    const sanitizedToken = String(token).startsWith("Bearer ")
        ? String(token).slice(7)
        : String(token);
    return jwt.verify(sanitizedToken, getJwtSecret());
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export function comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
}

export function authenticate(req, res, next) {
    const authorizationHeader = req.headers.authorization ||
        req.headers.Authorization;

    if (
        !authorizationHeader ||
        !String(authorizationHeader).startsWith("Bearer ")
    ) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const payload = verifyToken(authorizationHeader);
        req.user = payload;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}

export function requireAdmin(req, res, next) {
    const authorizationHeader = req.headers.authorization ||
        req.headers.Authorization;

    if (
        !authorizationHeader ||
        !String(authorizationHeader).startsWith("Bearer ")
    ) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const payload = verifyToken(authorizationHeader);
        req.user = payload;

        if (payload.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: admin access required",
            });
        }

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
