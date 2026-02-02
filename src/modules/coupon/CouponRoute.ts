import express from "express";
import * as CouponController from "./CouponController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Voucher and Coupon management
 */

/**
 * @swagger
 * /vouchers:
 *   get:
 *     summary: Get All Active Coupons
 *     tags: [Coupon]
 *     responses:
 *       200:
 *         description: List of active coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Coupon Code
 *                   title:
 *                     type: string
 *                   subtitle:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [shipping, promo]
 *                   savingLabel:
 *                     type: string
 *                   validTo:
 *                     type: string
 *                     format: date-time
 */
router.get("/vouchers", CouponController.getCoupons);

/**
 * @swagger
 * /vouchers/check:
 *   post:
 *     summary: Check Coupon Validity
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, total, items]
 *             properties:
 *               code:
 *                 type: string
 *               total:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Coupon is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 discount:
 *                   type: number
 *       400:
 *         description: Invalid coupon
 */
router.post("/vouchers/check", CouponController.checkCoupon);

export default router;
