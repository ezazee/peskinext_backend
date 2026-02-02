import express from "express";
import * as InvoiceController from "./InvoiceController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Invoice management
 */

/**
 * @swagger
 * /invoices/{orderId}:
 *   get:
 *     summary: Get Invoice by Order ID
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice_number:
 *                   type: string
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 */
router.get("/invoices/:orderId", InvoiceController.getInvoice);

export default router;
