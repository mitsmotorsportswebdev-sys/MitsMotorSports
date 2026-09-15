import express from "express";
import { login, seedAdmin } from "../controllers/authController.js";
import {
    createProject,
    upsertAbout,
    upsertHome,
} from "../controllers/contentController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
    getPageUploadHandler,
    processUploadedFile,
} from "../middleware/upload.js";
import { getUploadDirectory } from "../utils/security.js";

const router = express.Router();

router.post("/login", login);
router.post("/seed-admin", seedAdmin);

router.use(authenticate);
router.use(requireAdmin);

router.put("/home", upsertHome);
router.patch("/home", upsertHome);
router.put("/about", upsertAbout);
router.patch("/about", upsertAbout);
router.post("/projects", createProject);

const pageRoutes = [
    "home",
    "about",
    "projects",
    "team",
    "alumni",
    "sponsors",
    "gallery",
    "legacy",
];

for (const page of pageRoutes) {
    router.post(`/upload/${page}`, (req, res, next) => {
        const handler = getPageUploadHandler(page);
        handler(req, res, async (error) => {
            if (error) return next(error);

            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "Image file is required",
                    });
                }

                const generated = processUploadedFile(req.file, page);
                return res.status(201).json({ success: true, data: generated });
            } catch (fileError) {
                return next(fileError);
            }
        });
    });

    router.delete(`/upload/${page}`, (req, res) => {
        const uploadDir = getUploadDirectory(page);
        if (!uploadDir) {
            return res.status(400).json({
                success: false,
                message: "Invalid upload page",
            });
        }

        return res.status(200).json({
            success: true,
            data: { page, directory: uploadDir },
        });
    });
}

export default router;
