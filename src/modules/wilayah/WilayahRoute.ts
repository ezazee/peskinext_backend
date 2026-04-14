import express from "express";
import * as WilayahController from "./WilayahController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Ambil Daftar Provinsi
 *     description: "Mengambil data seluruh provinsi di Indonesia (Sumber: RajaOngkir)."
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar provinsi berhasil diambil.
 */
router.get("/provinces", WilayahController.getProvinces);

/**
 * @swagger
 * /regencies/{province_code}:
 *   get:
 *     summary: Ambil Daftar Kota/Kabupaten
 *     description: Mengambil semua data kota atau kabupaten berdasarkan kode provinsi tertentu.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: province_code
 *         required: true
 *         schema: { type: string }
 *         description: Kode/ID Provinsi.
 *     responses:
 *       200:
 *         description: Daftar kota/kabupaten ditemukan.
 */
router.get("/regencies/:province_code", WilayahController.getRegencies);

/**
 * @swagger
 * /districts/{regency_code}:
 *   get:
 *     summary: Ambil Daftar Kecamatan
 *     description: Mengambil semua data kecamatan berdasarkan kode kota/kabupaten tertentu.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: regency_code
 *         required: true
 *         schema: { type: string }
 *         description: Kode/ID Kota/Kabupaten.
 *     responses:
 *       200:
 *         description: Daftar kecamatan ditemukan.
 */
router.get("/districts/:regency_code", WilayahController.getDistricts);

/**
 * @swagger
 * /villages/{district_code}:
 *   get:
 *     summary: Ambil Daftar Kelurahan/Desa
 *     description: Mengambil semua data kelurahan atau desa berdasarkan kode kecamatan tertentu.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: district_code
 *         required: true
 *         schema: { type: string }
 *         description: Kode/ID Kecamatan.
 *     responses:
 *       200:
 *         description: Daftar kelurahan/desa ditemukan.
 */
router.get("/villages/:district_code", WilayahController.getVillages);

export default router;
