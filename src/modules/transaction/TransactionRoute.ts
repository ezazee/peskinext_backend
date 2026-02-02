import express from "express";
import * as TransactionController from "./TransactionController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Payment and transaction management
 */

/**
 * @swagger
 * /transactions/callback:
 *   post:
 *     summary: Handle Payment Callback (DOKU)
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   invoice_number:
 *                     type: string
 *               transaction:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *     responses:
 *       200:
 *         description: Callback processed
 */
router.post("/transactions/callback", TransactionController.handlePaymentCallback);

/**
 * @swagger
 * /transactions/{orderId}:
 *   get:
 *     summary: Get Transaction by Order ID
 *     tags: [Transaction]
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
 *         description: Transaction details
 */
router.get("/transactions/:orderId", TransactionController.getTransaction);

export default router;
