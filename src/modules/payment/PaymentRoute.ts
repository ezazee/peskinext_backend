import express from "express";
import * as PaymentController from "./PaymentController";

const router = express.Router();

router.post("/payment/create", PaymentController.createPayment);
router.post("/payment/notification", PaymentController.handleNotification);

export default router;
