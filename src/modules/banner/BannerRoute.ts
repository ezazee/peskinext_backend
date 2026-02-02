import express from "express";
import * as BannerController from "./BannerController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banner
 *   description: Banner management for Carousel and Tiles
 */

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get All Banners
 *     tags: [Banner]
 *     responses:
 *       200:
 *         description: List of banners grouped by section (carousel/tiles)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 main:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       src:
 *                         type: string
 *                       mobileSrc:
 *                         type: string
 *                       alt:
 *                         type: string
 *                       redirect:
 *                         type: string
 *                 carousel:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       src:
 *                         type: string
 *                       alt:
 *                         type: string
 *                       redirect:
 *                         type: string
 *                 tiles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       src:
 *                         type: string
 *                       alt:
 *                         type: string
 *                       redirect:
 *                         type: string
 */
router.get("/banners", BannerController.getBanners);

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Create New Banner
 *     tags: [Banner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [section, image_url, alt_text]
 *             properties:
 *               section:
 *                 type: string
 *                 enum: [main, carousel, tiles]
 *               image_url:
 *                 type: string
 *               alt_text:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               redirect_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Banner created
 */
router.post("/banners", BannerController.createBanner); // Admin only in future

export default router;
