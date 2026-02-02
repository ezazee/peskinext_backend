import express from "express";
import * as ReviewController from "./ReviewController";
import { requireUserAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Product reviews management
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get Reviews by Product
 *     tags: [Review]
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Slug
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user:
 *                     type: string
 *                   variant:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   date:
 *                     type: string
 *                     format: date
 */
router.get("/reviews", ReviewController.getReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create New Review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productSlug, rating, comment]
 *             properties:
 *               productSlug:
 *                 type: string
 *               variantName:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post("/reviews", requireUserAuth(), ReviewController.createReview);

export default router;
