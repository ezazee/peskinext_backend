import express from "express";
import * as WilayahController from "./WilayahController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wilayah
 *   description: Indonesian region data
 */

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Get All Provinces
 *     tags: [Wilayah]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get("/provinces", WilayahController.getProvinces);

/**
 * @swagger
 * /regencies/{province_code}:
 *   get:
 *     summary: Get Regencies by Province Code
 *     tags: [Wilayah]
 *     parameters:
 *       - in: path
 *         name: province_code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of regencies
 */
router.get("/regencies/:province_code", WilayahController.getRegencies);

/**
 * @swagger
 * /districts/{regency_code}:
 *   get:
 *     summary: Get Districts by Regency Code
 *     tags: [Wilayah]
 *     parameters:
 *       - in: path
 *         name: regency_code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get("/districts/:regency_code", WilayahController.getDistricts);

/**
 * @swagger
 * /villages/{district_code}:
 *   get:
 *     summary: Get Villages by District Code
 *     tags: [Wilayah]
 *     parameters:
 *       - in: path
 *         name: district_code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of villages
 */
router.get("/villages/:district_code", WilayahController.getVillages);

export default router;
