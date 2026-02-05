import { Request, Response } from "express";
import Categories from "../models/CategoryModel";
import slugify from "slugify";

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, parent_id } = req.body;
        const generatedSlug = slug || slugify(name, { lower: true, strict: true });

        const category = await Categories.create({
            name,
            slug: generatedSlug,
            parent_id: parent_id || null,
        });

        res.status(201).json({ message: "Category created successfully", id: category.id });
    } catch (error: any) {
        console.error("❌ Error createCategory:", error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Categories.findAll({
            where: { parent_id: null },
            include: [{ model: Categories, as: "subcategories" }],
        });
        res.json(categories);
    } catch (error: any) {
        console.error("❌ Error getCategories:", error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, slug, parent_id } = req.body;

        const category = await Categories.findByPk(id as string);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const generatedSlug = slug || (name ? slugify(name, { lower: true, strict: true }) : category.slug);

        await category.update({
            name: name || category.name,
            slug: generatedSlug,
            parent_id: parent_id !== undefined ? parent_id : category.parent_id,
        });

        res.json({ message: "Category updated successfully" });
    } catch (error: any) {
        console.error("❌ Error updateCategory:", error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Categories.findByPk(id as string);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await category.destroy();
        res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
        console.error("❌ Error deleteCategory:", error);
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};
