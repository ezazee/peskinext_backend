
import fetch from "node-fetch";
import db from "../config/database";
import Transactions from "../modules/transaction/models/TransactionModel";
import Orders from "../modules/order/models/OrderModel";

// Helper to find Order ID from Invoice
const requestPickup = async () => {
    // CHANGE THIS TO THE INVOICE YOU WANT TO TEST
    const targetInvoice = "INV-1770792863500";
    // const targetInvoice = "YOUR_INVOICE_HERE";

    try {
        console.log(`🔍 Searching for transaction with invoice: ${targetInvoice}`);

        // 1. Find Transaction first to get Order ID (since Orders doesn't have invoice_number)
        const transaction = await Transactions.findOne({ where: { invoice_number: targetInvoice } });

        if (!transaction) {
            console.error(`❌ Transaction with invoice ${targetInvoice} not found.`);
            return;
        }

        console.log(`✅ Transaction Found! Order ID: ${transaction.order_id}`);

        // 2. Find Order
        const order = await Orders.findByPk(transaction.order_id);

        if (!order) {
            console.error("❌ Order not found!");
            return;
        }

        console.log(`ℹ️ Current Status: ${order.status}`);
        console.log(`ℹ️ Courier Service: ${order.courier_service || "(Default)"}`);

        if (order.status !== 'processing') {
            console.warn("⚠️ Order is not in 'processing' (Sedang Dikemas) status. Request might fail or logic might prevent it.");
        }

        // Call the endpoint
        const port = process.env.PORT || 5000;
        // CORRECTED URL: Must include /api/v1
        const url = `http://localhost:${port}/api/v1/shipping/order/${order.id}`;

        console.log(`🚚 Requesting Pickup to Biteship...`);
        console.log(`📡 Endpoint: ${url}`);

        const res = await fetch(url, { method: "POST" });
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("text/html")) {
            const text = await res.text();
            console.error(`❌ Received HTML instead of JSON. Server may be down, URL wrong, or Auth failed.`);
            // console.error(text.substring(0, 200)); 
            return;
        }

        const data = await res.json() as any;

        if (res.ok) {
            console.log("✅ Pickup Request Successful!");
            console.log("📦 Biteship Order ID:", data.biteship_id);
            // console.log("📄 Full Response:", JSON.stringify(data, null, 2));
        } else {
            console.error("❌ Pickup Request Failed!");
            console.error("Reason:", data.message);
            console.error("Error Details:", JSON.stringify(data.error, null, 2));
        }

    } catch (error) {
        console.error("❌ Script Error:", error);
    } finally {
        await db.close();
    }
};

requestPickup();
