import crypto from "node:crypto";
import { isValidObjectId as mongooseIsValidObjectId } from "mongoose";

const PAGE_DIRECTORIES = {
    home: "uploads/home",
    about: "uploads/about",
    projects: "uploads/projects",
    team: "uploads/team",
    alumni: "uploads/alumni",
    sponsors: "uploads/sponsors",
    gallery: "uploads/gallery",
    legacy: "uploads/legacy",
};

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isValidObjectId(value) {
    if (typeof value !== "string") {
        return false;
    }

    return /^[0-9a-fA-F]{24}$/.test(value) && mongooseIsValidObjectId(value);
}

export function filterAllowedFields(source = {}, allowedFields = []) {
    const result = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(source, field)) {
            result[field] = source[field];
        }
    }

    return result;
}

export function isSafePageName(value) {
    if (typeof value !== "string") {
        return false;
    }

    const normalized = value.trim();

    if (
        !normalized || normalized.includes("..") || normalized.includes("/") ||
        normalized.includes("\\")
    ) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(PAGE_DIRECTORIES, normalized);
}

export function getUploadDirectory(page) {
    if (!isSafePageName(page)) {
        return null;
    }

    return PAGE_DIRECTORIES[page];
}

export function getProjectUploadDirectory(slug) {
    if (
        typeof slug !== "string" || !slug.trim() || slug.includes("..") ||
        slug.includes("/")
    ) {
        return null;
    }

    const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
    return `uploads/projects/${safeSlug}`;
}

export function isAllowedImageMimeType(mimeType) {
    return typeof mimeType === "string" &&
        ALLOWED_MIME_TYPES.has(mimeType.toLowerCase());
}

export function isAllowedImageExtension(filename = "") {
    const extension = String(filename).split(".").pop()?.toLowerCase();
    return typeof extension === "string" &&
        ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

export function sanitizeFilename(originalName = "upload") {
    const extension = String(originalName).split(".").pop()?.toLowerCase() ||
        "jpg";
    const safeExtension = ALLOWED_IMAGE_EXTENSIONS.has(extension)
        ? extension
        : "jpg";
    const fileName = `${crypto.randomUUID()}.${safeExtension}`;
    return fileName;
}

export function validateImageFile(file) {
    if (!file) {
        return { valid: false, reason: "Missing file" };
    }

    if (!file.buffer || file.buffer.length === 0) {
        return { valid: false, reason: "Empty file" };
    }

    const mimeType = file.mimetype || "";
    const fileName = file.originalname || "";

    if (!isAllowedImageMimeType(mimeType)) {
        return { valid: false, reason: "Unsupported file type" };
    }

    if (!isAllowedImageExtension(fileName)) {
        return { valid: false, reason: "Unsupported file extension" };
    }

    const signature = file.buffer.subarray(0, 12);
    const isJpeg = signature[0] === 0xff && signature[1] === 0xd8;
    const isPng = signature[0] === 0x89 && signature[1] === 0x50 &&
        signature[2] === 0x4e && signature[3] === 0x47;
    const isWebp = signature[0] === 0x52 && signature[1] === 0x49 &&
        signature[2] === 0x46 && signature[3] === 0x46;

    const validSignature = isJpeg || isPng ||
        (isWebp && signature.slice(8, 12).toString("ascii") === "WEBP");

    if (!validSignature) {
        return {
            valid: false,
            reason: "File signature does not match an allowed image format",
        };
    }

    return { valid: true };
}

export function createSafeImageRecord(file, relativePath) {
    return {
        url: `/${relativePath.replace(/\\/g, "/")}`,
        filename: file.filename,
        type: file.mimetype,
        size: file.size,
    };
}
