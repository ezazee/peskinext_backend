
import db from "../config/database";
import Orders from "../modules/order/models/OrderModel";
import * as NotificationService from "../modules/notification/NotificationService"; // Ensure this service exists and is imported correctly

const simulateShipped = async () => {
    // CHANGE THIS TO THE ORDER ID YOU ARE TESTING
    const targetOrderId = "cf64777c-620b-450e-a9c4-b112ddbae979";
    const dummyTrackingNumber = "TEST-RESI-BITESHIP-001";

    try {
        console.log(`🔍 Searching for Order ID: ${targetOrderId}`);
        const order = await Orders.findByPk(targetOrderId);

        if (!order) {
            console.error("❌ Order not found!");
            return;
        }

        console.log(`ℹ️ Current Status: ${order.status}`);

        if (order.status === 'shipped') {
            console.log("✅ Order is already 'shipped'.");
            return;
        }

        console.log("🚚 Simulating Courier Pickup...");

        // Update Order to Shipped
        order.status = "shipped";
        order.tracking_number = dummyTrackingNumber;
        await order.save();

        console.log("✅ Order status updated to 'shipped'");
        console.log(`#️⃣ Tracking Number set to: ${dummyTrackingNumber}`);

        // Trigger Notification (Optional, mimics real controller logic)
        // Check if NotificationService has createNotification
        if (NotificationService && typeof NotificationService.createNotification === 'function') {
            try {
                await NotificationService.createNotification({
                    user_id: order.user_id,
                    title: "🚚 Paket Sedang Dikirim",
                    message: `Pesanan #${order.id.substring(0, 8)} sedang dalam perjalanan. Resi: ${dummyTrackingNumber}`,
                    type: "info",
                    category: "transaction",
                    status: "ongoing",
                    actionUrl: `/orders/${order.id}`,
                    metadata: { order_id: order.id, tracking_number: dummyTrackingNumber }
                });
                console.log("🔔 Notification sent to user.");
            } catch (notifyErr) {
                console.warn("⚠️ Failed to send notification (non-critical):", notifyErr);
            }
        }

        console.log("\n✅ SIMULATION COMPLETE");
        console.log("👉 Please check the Frontend User App.");
        console.log("👉 Status should be 'Sedang Dikirim' (Shipped).");
        console.log("👉 Tracking info should be visible.");

    } catch (error) {
        console.error("❌ Script Error:", error);
    } finally {
        await db.close();
    }
};

simulateShipped();
