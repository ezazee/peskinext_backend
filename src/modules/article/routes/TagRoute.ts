import express from "express";
import * as TagController from "../controllers/TagController";

const router = express.Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get All Tags
 *     tags: [Article]
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get("/tags", TagController.getTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get Tag by ID
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag details
 */
router.get("/tags/:id", TagController.getTagById);

/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Update Tag
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 */
router.patch("/tags/:id", TagController.updateTag);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete Tag
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag deleted
 */
router.delete("/tags/:id", TagController.deleteTag);

export default router;
