import express from "express";
import * as OrderController from "./OrderController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create New Order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, courier, shipping_cost]
 *             properties:
 *               user_id:
 *                 type: string
 *               courier:
 *                 type: string
 *               shipping_cost:
 *                 type: number
 *               coupon_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/orders", OrderController.createOrder);

/**
 * @swagger
 * /orders/{user_id}:
 *   get:
 *     summary: Get Orders by User ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/orders/:user_id", OrderController.getOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update Order Status
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch("/orders/:id/status", OrderController.updateOrderStatus);

export default router;
