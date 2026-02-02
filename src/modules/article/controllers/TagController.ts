import { Request, Response } from "express";
import Tags from "../models/TagModel";
import slugify from "slugify";

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await Tags.findAll();
        res.json(tags);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch tags" });
    }
};

export const getTagById = async (req: Request, res: Response) => {
    try {
        const tag = await Tags.findByPk(req.params.id);
        if (!tag) return res.status(404).json({ message: "Tag not found" });
        res.json(tag);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch Tag" });
    }
};

export const updateTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        const generatedSlug = slug || slugify(name, { lower: true, strict: true });

        const tag = await Tags.findByPk(id);
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        await tag.update({
            name: name || tag.name,
            slug: generatedSlug,
        });

        res.json({ message: "Tag updated successfully", data: tag });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update tag", error: error.message });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tag = await Tags.findByPk(id);

        if (!tag) return res.status(404).json({ message: "Tag not found" });

        await tag.destroy();
        res.json({ message: "Tag deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete tag", error: error.message });
    }
};
