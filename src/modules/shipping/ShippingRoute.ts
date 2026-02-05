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

/**
 * @swagger
 * /shipping/webhook:
 *   post:
 *     summary: Handle Biteship Webhooks
 *     tags: [Shipping]
 *     description: Endpoint to receive order status updates from Biteship.
 *     parameters:
 *       - in: header
 *         name: x-biteship-signature
 *         schema:
 *           type: string
 *         description: Signature for verification
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
router.post("/shipping/webhook", ShippingController.handleWebhook);

export default router;
