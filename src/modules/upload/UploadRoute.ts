import express from "express";
import * as UploadController from "./UploadController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

/**
 * @swagger
 * /upload/single:
 *   post:
 *     summary: Upload Single File
 *     tags: [Upload]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [article, product]
 *     responses:
 *       200:
 *         description: File uploaded
 */
router.post("/upload/single", UploadController.uploadSingle, UploadController.handleUploadSingle);

/**
 * @swagger
 * /upload/multiple:
 *   post:
 *     summary: Upload Multiple Files
 *     tags: [Upload]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               type:
 *                 type: string
 *                 enum: [article, product]
 *     responses:
 *       200:
 *         description: Files uploaded
 */
router.post("/upload/multiple", UploadController.uploadMultiple, UploadController.handleUploadMultiple);

export default router;
