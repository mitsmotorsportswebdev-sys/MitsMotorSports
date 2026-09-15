import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import {
    getUploadDirectory,
    sanitizeFilename,
    validateImageFile,
} from "../utils/security.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10,
    },
    fileFilter: (_req, file, callback) => {
        const extension = file.originalname.split(".").pop()?.toLowerCase();
        const allowed = ["jpg", "jpeg", "png", "webp"];

        if (!file.mimetype || !allowed.includes(extension || "")) {
            return callback(new Error("Unsupported file type"));
        }

        if (
            !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
        ) {
            return callback(new Error("Unsupported MIME type"));
        }

        callback(null, true);
    },
});

export function ensureUploadDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

export function getPageUploadHandler(pageKey) {
    const destination = getUploadDirectory(pageKey);
    if (!destination) {
        throw new Error("Invalid page upload key");
    }

    const fullPath = path.resolve(destination);
    ensureUploadDirectory(fullPath);

    return upload.single("image");
}

export function processUploadedFile(file, pageKey) {
    if (!file) {
        throw new Error("Missing file");
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.reason);
    }

    const directory = getUploadDirectory(pageKey);
    if (!directory) {
        throw new Error("Invalid upload page");
    }

    const resolvedPath = path.resolve(directory);
    ensureUploadDirectory(resolvedPath);

    const generatedName = sanitizeFilename(file.originalname);
    const fullPath = path.join(resolvedPath, generatedName);

    fs.writeFileSync(fullPath, file.buffer);

    return {
        url: `/${directory.replace(/\\/g, "/")}/${generatedName}`,
        filename: generatedName,
        type: file.mimetype,
        size: file.size,
        path: fullPath,
    };
}
