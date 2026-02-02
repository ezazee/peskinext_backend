import express from "express";
import * as CategoryController from "../controllers/CategoryController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Article
 *   description: Article management (Posts, Categories, Tags)
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create Article Category
 *     tags: [Article]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/categories", CategoryController.createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get All Article Categories
 *     tags: [Article]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", CategoryController.getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update Article Category
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
 *         description: Category updated
 */
router.patch("/categories/:id", CategoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete Article Category
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete("/categories/:id", CategoryController.deleteCategory);

export default router;
