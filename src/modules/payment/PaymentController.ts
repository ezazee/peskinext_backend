import { Request, Response } from "express";
import * as DokuService from "./services/DokuService";
import Orders from "../order/models/OrderModel";
import Transaction from "../transaction/models/TransactionModel";
import UserModel from "../user/models/UserModel";

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { order_id } = req.body;

        // 1. Fetch Order
        const order = await Orders.findByPk(order_id, {
            include: [{ model: UserModel, as: "user" }]
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 2. Fetch or Create Transaction
        // We usually should have created a transaction in pending state before this, 
        // but let's ensure we have a transaction record to link the invoice.
        let transaction = await Transaction.findOne({ where: { order_id } });

        const invoiceNumber = transaction?.invoice_number || `INV-${Date.now()}`;
        const amount = Number(order.total_amount);

        // 3. User Data
        const user = (order as any).user;
        const customerData = {
            name: user?.fullname || "Guest",
            email: user?.email || "guest@example.com",
            phone: user?.phone || "0800000000"
        };

        // 4. Generate Link
        const paymentUrl = await DokuService.generatePaymentUrl(invoiceNumber, amount, customerData);

        // 5. Update Transaction (if exists) or Create (if not)
        if (!transaction) {
            transaction = await Transaction.create({
                order_id: order.id,
                invoice_number: invoiceNumber,
                amount: amount,
                status: "pending",
                payment_channel: "doku_payment_link"
            });
        }

        // Save URL? Maybe not needed to save ID, just redirect.

        res.json({
            success: true,
            payment_url: paymentUrl,
            invoice_number: invoiceNumber
        });

    } catch (error: any) {
        console.error("Payment Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const handleNotification = async (req: Request, res: Response) => {
    // DOKU sends notification here
    console.log("DOKU Notification Received", req.body);

    try {
        // DOKU usually sends 'order_id' as the Invoice Number/Reference
        const { order_id: invoice_number, transaction_status } = req.body;

        if (!invoice_number) {
            console.log("❌ Invalid notification payload: missing order_id/invoice_number");
            return res.status(200).json({ message: "OK" }); // Return OK to stop retry? Or 400. User said Always 200.
        }

        // Find transaction by invoice_number
        const transaction = await Transaction.findOne({ where: { invoice_number } });

        if (!transaction) {
            console.log(`❌ Transaction not found for invoice: ${invoice_number}`);
            return res.status(200).json({ message: "OK" }); // Transaction not found, no point retrying
        }

        console.log(`✅ Transaction found: ${transaction.id}, Status: ${transaction_status}`);

        // Update based on status
        if (transaction_status === "SUCCESS" || transaction_status === "SETTLED") {
            transaction.status = "success";
            transaction.doku_response = req.body;
            await transaction.save();

            // Update Order Status
            const order = await Orders.findByPk(transaction.order_id);
            if (order) {
                // Check if already paid to avoid double update logic
                if (order.status !== 'paid') {
                    order.status = "paid";
                    await order.save();
                    console.log(`✅ Order ${order.id} status updated to 'paid'`);
                }
            }
        } else if (transaction_status === "FAILED") {
            transaction.status = "failed";
            transaction.doku_response = req.body;
            await transaction.save();
            // Maybe cancel order too?
        }

        res.status(200).json({ message: "OK" });

    } catch (error: any) {
        console.error("❌ Notification Error:", error);
        // Even on error, maybe return 200 to stop Doku from retrying indefinitely if it's code bug? 
        // But usually 500 triggers retry which is good for transient errors.
        // User instruction: "Selalu return HTTP 200".
        res.status(200).json({ message: "OK" });
    }
}
