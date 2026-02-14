import { Request, Response } from "express";
import Posts from "../models/PostModel";
import Categories from "../models/CategoryModel";
import Tags from "../models/TagModel";
import PostImages from "../models/PostImageModel";
import slugify from "slugify";
import db from "../../../config/database";

export const createPost = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { title, slug, content, category_id, user_id, tags, images } = req.body;

        const generatedSlug = slug || slugify(title, { lower: true, strict: true });

        const post = await Posts.create(
            { title, slug: generatedSlug, content, category_id, user_id },
            { transaction: t }
        );

        if (tags && tags.length > 0) {
            const tagInstances: Tags[] = [];
            for (const tagName of tags) {
                const [tag] = await Tags.findOrCreate({
                    where: { name: tagName.toLowerCase() },
                    defaults: {
                        name: tagName.toLowerCase(),
                        slug: tagName.toLowerCase().replace(/\s+/g, "-"),
                    } as any,
                    transaction: t,
                });
                tagInstances.push(tag);
            }
            await post.setTags(tagInstances, { transaction: t });
        }

        if (images && images.length > 0) {
            const imageRecords = images.map((img: any) => ({
                post_id: post.id,
                image_url: img.url,
                alt_text: img.alt || null,
            }));
            await PostImages.bulkCreate(imageRecords, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: "Post created successfully", id: post.id });
    } catch (error: any) {
        await t.rollback();
        console.error("❌ Error createPost:", error);
        res.status(500).json({
            message: "Failed to create post",
            error: error.message,
        });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const categorySlug = req.query.category as string;

        // Calculate default offset or use manual override
        let offset = (page - 1) * limit;
        if (req.query.offset) {
            offset = parseInt(req.query.offset as string);
        }

        console.log("🔍 [getAllPosts] Query Params:", req.query);
        console.log("🔍 [getAllPosts] Filtering by Category Slug:", categorySlug);

        const includeOptions: any[] = [
            {
                model: Categories,
                attributes: ["id", "name", "slug"],
                // If categorySlug is present, filter by it. This creates an INNER JOIN.
                required: !!categorySlug,
                where: categorySlug ? { slug: categorySlug } : undefined
            },
            { model: Tags, through: { attributes: [] }, attributes: ["id", "name"] },
            { model: PostImages, as: "images", attributes: ["id", "image_url", "alt_text"] },
        ];

        const { count, rows } = await Posts.findAndCountAll({
            where: req.query.slug ? { slug: req.query.slug as string } : undefined,
            include: includeOptions,
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']],
            distinct: true // Important for correct count with includes
        });

        console.log(`✅ [getAllPosts] Found ${count} posts for category: ${categorySlug || 'ALL'}`);

        res.json({
            count,
            rows,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error: any) {
        console.error("❌ Error getAllPosts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Posts.findByPk(req.params.id as string, {
            include: [
                { model: Categories, attributes: ["id", "name", "slug"] },
                { model: Tags, through: { attributes: [] }, attributes: ["id", "name"] },
                { model: PostImages, as: "images", attributes: ["id", "image_url", "alt_text"] },
            ],
        });
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch post" });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const { title, content, category_id, tags } = req.body;

        const post = await Posts.findByPk(req.params.id as string);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.update({ title, content, category_id });

        if (tags) {
            // Logic to resolve/findOrCreate tags and set them
            // Simplified: explicit setTags if expected to be ids or objects, but logic in createPost
            // handles names. Replicating logical consistency is key.
            // For now assume names array like create:
            if (Array.isArray(tags)) {
                const tagInstances: Tags[] = [];
                for (const tagName of tags) {
                    const [tag] = await Tags.findOrCreate({ where: { name: tagName } });
                    tagInstances.push(tag);
                }
                await post.setTags(tagInstances);
            }
        }

        res.json({ message: "Post updated successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update post" });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const post = await Posts.findByPk(req.params.id as string);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.destroy();
        res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete post" });
    }
};
