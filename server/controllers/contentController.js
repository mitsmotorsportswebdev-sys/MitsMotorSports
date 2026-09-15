import About from "../models/About.js";
import Home from "../models/Home.js";
import Project from "../models/Project.js";
import TeamMember from "../models/TeamMember.js";
import Sponsor from "../models/Sponsor.js";
import GalleryItem from "../models/GalleryItem.js";
import Legacy from "../models/Legacy.js";
import {
    filterAllowedFields,
    getProjectUploadDirectory,
    isValidObjectId,
} from "../utils/security.js";

const handleSingletonGet = async (Model, query = {}) => {
    const item = await Model.findOne({ ...query, isPublished: true }).sort({
        createdAt: -1,
    }).lean();
    return item;
};

const handleSingletonUpsert = async (Model, payload, allowedFields) => {
    const document = await Model.findOne({}).sort({ createdAt: -1 });
    const sanitized = filterAllowedFields(payload, allowedFields);

    if (document) {
        Object.assign(document, sanitized);
        await document.save();
        return document;
    }

    return Model.create(sanitized);
};

export async function getHome(req, res, next) {
    try {
        const home = await handleSingletonGet(Home);
        return res.status(200).json({ success: true, data: home || null });
    } catch (error) {
        return next(error);
    }
}

export async function upsertHome(req, res, next) {
    try {
        const home = await handleSingletonUpsert(Home, req.body, [
            "title",
            "subtitle",
            "heroImage",
            "sections",
            "isPublished",
        ]);
        return res.status(200).json({ success: true, data: home });
    } catch (error) {
        return next(error);
    }
}

export async function getAbout(req, res, next) {
    try {
        const about = await handleSingletonGet(About);
        return res.status(200).json({ success: true, data: about || null });
    } catch (error) {
        return next(error);
    }
}

export async function upsertAbout(req, res, next) {
    try {
        const about = await handleSingletonUpsert(About, req.body, [
            "title",
            "content",
            "image",
            "isPublished",
        ]);
        return res.status(200).json({ success: true, data: about });
    } catch (error) {
        return next(error);
    }
}

export async function listProjects(req, res, next) {
    try {
        const projects = await Project.find({ isPublished: true }).sort({
            order: 1,
            createdAt: -1,
        }).lean();
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        return next(error);
    }
}

export async function getProjectById(req, res, next) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project id",
            });
        }

        const project = await Project.findOne({ _id: id, isPublished: true })
            .lean();
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({ success: true, data: project });
    } catch (error) {
        return next(error);
    }
}

export async function createProject(req, res, next) {
    try {
        const { slug, name, description, category, image, isPublished, order } =
            req.body || {};

        if (!slug || !name) {
            return res.status(400).json({
                success: false,
                message: "Project slug and name are required",
            });
        }

        const safeProject = getProjectUploadDirectory(slug);
        if (!safeProject) {
            return res.status(400).json({
                success: false,
                message: "Invalid project slug",
            });
        }

        const founded = await Project.create({
            slug: String(slug).trim().toLowerCase(),
            name: String(name).trim(),
            description: description ? String(description) : "",
            category: category ? String(category) : "general",
            image: image || {},
            isPublished: isPublished !== false,
            order: Number.isFinite(Number(order)) ? Number(order) : 0,
        });

        return res.status(201).json({ success: true, data: founded });
    } catch (error) {
        return next(error);
    }
}

export async function listTeam(req, res, next) {
    try {
        const members = await TeamMember.find({ isPublished: true }).sort({
            order: 1,
            createdAt: -1,
        }).lean();
        return res.status(200).json({ success: true, data: members });
    } catch (error) {
        return next(error);
    }
}

export async function listSponsors(req, res, next) {
    try {
        const sponsors = await Sponsor.find({ isPublished: true }).sort({
            order: 1,
            createdAt: -1,
        }).lean();
        return res.status(200).json({ success: true, data: sponsors });
    } catch (error) {
        return next(error);
    }
}

export async function listGallery(req, res, next) {
    try {
        const items = await GalleryItem.find({ isPublished: true }).sort({
            order: 1,
            createdAt: -1,
        }).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return next(error);
    }
}

export async function listLegacy(req, res, next) {
    try {
        const items = await Legacy.find({ isPublished: true }).sort({
            order: 1,
            createdAt: -1,
        }).lean();
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        return next(error);
    }
}

export async function listAlumni(req, res, next) {
    try {
        return res.status(200).json({ success: true, data: [] });
    } catch (error) {
        return next(error);
    }
}
