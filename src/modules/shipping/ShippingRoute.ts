import express from "express";
import * as ShippingController from "./ShippingController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shipping
 *   description: Shipping cost check
 */

/**
 * @swagger
 * /shipping/check-ongkir:
 *   post:
 *     summary: Check Shipping Cost (RajaOngkir)
 *     tags: [Shipping]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Shipping cost details
 */
router.post("/shipping/check-ongkir", ShippingController.checkOngkir);

export default router;
