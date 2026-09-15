import express from "express";
import {
    getAbout,
    getHome,
    listAlumni,
    listGallery,
    listLegacy,
    listProjects,
    listSponsors,
    listTeam,
} from "../controllers/contentController.js";

const router = express.Router();

router.get("/home", getHome);
router.get("/about", getAbout);
router.get("/projects", listProjects);
router.get("/team", listTeam);
router.get("/alumni", listAlumni);
router.get("/sponsors", listSponsors);
router.get("/gallery", listGallery);
router.get("/legacy", listLegacy);

export default router;
