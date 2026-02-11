/**
 * Debug script to check if review was saved and verify backend query logic
 */

import Reviews from "../modules/review/models/ReviewModel";
import Orders from "../modules/order/models/OrderModel";
import OrderItems from "../modules/order/models/OrderItemModel";

async function debugReview() {
    try {
        const orderId = "cf64777c-620b-450e-a9c4-b112ddbae979";

        console.log("🔍 Checking order:", orderId);

        // Get order with items
        const order = await Orders.findByPk(orderId, {
            include: [
                {
                    model: OrderItems,
                    as: "items"
                }
            ]
        });

        if (!order) {
            console.log("❌ Order not found");
            return;
        }

        const orderJson = order.toJSON() as any;
        console.log("📦 Order found with", orderJson.items?.length, "items");
        console.log("👤 User ID:", orderJson.user_id);

        // Check all reviews for this order
        const allReviews = await Reviews.findAll({
            where: {
                order_id: orderId
            }
        });

        console.log("📝 Total reviews for this order:", allReviews.length);

        if (allReviews.length > 0) {
            allReviews.forEach((review, idx) => {
                const r = review.toJSON() as any;
                console.log(`\n Review #${idx + 1}:`);
                console.log(`   - Product ID: ${r.product_id}`);
                console.log(`   - Variant ID: ${r.variant_id}`);
                console.log(`   - User ID: ${r.user_id}`);
                console.log(`   - Rating: ${r.rating}`);
                console.log(`   - Comment: ${r.comment?.substring(0, 50)}...`);
            });
        }

        // Check each order item
        if (orderJson.items) {
            console.log("\n📋 Checking review status for each item:");
            for (const item of orderJson.items) {
                console.log(`\n  Item Product ID: ${item.product_id}`);
                console.log(`  Item Variant ID: ${item.variant_id || null}`);

                const existingReview = await Reviews.findOne({
                    where: {
                        user_id: orderJson.user_id,
                        product_id: item.product_id,
                        order_id: orderId,
                        variant_id: item.variant_id || null
                    }
                });

                if (existingReview) {
                    console.log(`  ✅ Review exists for this item`);
                } else {
                    console.log(`  ❌ No review found for this item`);
                }
            }
        }

        process.exit(0);
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

debugReview();
