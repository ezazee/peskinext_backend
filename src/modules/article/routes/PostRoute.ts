import express from "express";
import * as PostController from "../controllers/PostController";

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get All Posts
 *     tags: [Article]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/posts", PostController.getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get Post by ID
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post details
 */
router.get("/posts/:id", PostController.getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create New Post
 *     tags: [Article]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               author_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post created
 */
router.post("/posts", PostController.createPost);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update Post
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 */
router.patch("/posts/:id", PostController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete Post
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete("/posts/:id", PostController.deletePost);

export default router;
