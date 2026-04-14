import express from "express";
import * as UploadController from "./UploadController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System & Media
 *   description: Upload file gambar/video dan tools internal pemeliharaan server.
 */

/**
 * @swagger
 * /upload/single:
 *   post:
 *     summary: Upload Satu File
 *     description: "Mengunggah satu file gambar atau video ke storage server (misal: untuk foto profil atau thumbnail artikel)."
 *     tags: [System & Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, type]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "File yang akan diupload (Max: Tergantung tipe. Image biasa 2-5MB, Video review max 50MB)."
 *               type:
 *                 type: string
 *                 enum: [article, product, user, branding, review]
 *                 description: Tempat atau folder tujuan file disimpan.
 *     responses:
 *       200:
 *         description: File berhasil diupload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 file_url: { type: string, description: "URL publik untuk mengakses file tersebut." }
 */
router.post("/upload/single", UploadController.uploadSingle, UploadController.handleUploadSingle);

/**
 * @swagger
 * /upload/multiple:
 *   post:
 *     summary: Upload Banyak File
 *     description: "Mengunggah beberapa file gambar atau video sekaligus (misal: untuk galeri produk atau lampiran review barang)."
 *     tags: [System & Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files, type]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Daftar file yang akan diupload.
 *               type:
 *                 type: string
 *                 enum: [article, product, user, branding, review]
 *                 description: Tempat atau folder tujuan file disimpan.
 *     responses:
 *       200:
 *         description: File berhasil diupload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 file_urls: { type: array, items: { type: string }, description: "Daftar URL publik dari file yang berhasil diupload." }
 */
router.post("/upload/multiple", UploadController.uploadMultiple, UploadController.handleUploadMultiple);

export default router;
