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

import * as BiteshipService from "../shipping/services/BiteshipService"; // Import Service

// ... existing imports ...

export const handleNotification = async (req: Request, res: Response) => {
    // DOKU sends notification here


    try {
        // Handle DOKU Checkout V2 (Jokul) Nested Structure
        let invoice_number = req.body.order?.invoice_number;
        let transaction_status = req.body.transaction?.status;

        // Fallback for Legacy/MIP (Flat structure)
        if (!invoice_number) {
            invoice_number = req.body.order_id || req.body.trans_id_merchant;
        }
        if (!transaction_status) {
            transaction_status = req.body.transaction_status || req.body.payment_status_code;
        }

        if (!invoice_number) {

            return res.status(200).json({ message: "OK" });
        }

        // Find transaction by invoice_number
        const transaction = await Transaction.findOne({ where: { invoice_number } });

        if (!transaction) {

            return res.status(200).json({ message: "OK" });
        }



        // Update based on status
        if (transaction_status === "SUCCESS" || transaction_status === "SETTLED" || transaction_status === "0000") {
            // Prevent double processing
            if (transaction.status === "success") {

                return res.status(200).json({ message: "OK" });
            }

            transaction.status = "success";
            transaction.doku_response = req.body;
            await transaction.save();

            // Update Order Status
            const order = await Orders.findByPk(transaction.order_id);
            if (order) {
                if (order.status !== 'paid') {
                    order.status = "paid";
                    await order.save();


                    // --- BITESHIP INTEGRATION START ---
                    // Auto create shipping order
                    const shippingResult = await BiteshipService.createBiteshipOrder(order);

                    if (shippingResult.success) {


                        // Update Order with Shipping Info
                        order.status = "shipped"; // Or "processed" / "ready_to_ship"
                        order.tracking_number = shippingResult.tracking_id || "";
                        if (shippingResult.biteship_order_id) {
                            order.biteship_order_id = shippingResult.biteship_order_id;
                        }
                        await order.save();


                    } else {
                        console.warn(`⚠️ Failed to create shipping order for Order ${order.id}. Manual retry required.`);
                        // Maybe update status to "processed" instead of "shipped" so admin knows to check?
                        // order.status = "processed"; 
                        // await order.save();
                    }
                    // --- BITESHIP INTEGRATION END ---
                }
            }
        } else if (transaction_status === "FAILED" || transaction_status === "EXPIRED") {
            transaction.status = "failed";
            transaction.doku_response = req.body;
            await transaction.save();
            // Optionally cancel order
            const order = await Orders.findByPk(transaction.order_id);
            if (order && order.status === 'pending') {
                order.status = 'cancelled';
                await order.save();
            }
        }

        res.status(200).json({ message: "OK" });

    } catch (error: any) {
        console.error("❌ Notification Error:", error);
        res.status(200).json({ message: "OK" }); // Always return OK to DOKU to stop retries if logic error
    }
}
