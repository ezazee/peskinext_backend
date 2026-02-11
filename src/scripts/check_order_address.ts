
import db from "../config/database";
import Orders from "../modules/order/models/OrderModel";
import Address from "../modules/user/models/AddressModel";

const checkOrder = async () => {
    try {
        const orderId = "cf64777c-620b-450e-a9c4-b112ddbae979";
        console.log(`🔍 Checking Order ID: ${orderId}`);

        const order = await Orders.findByPk(orderId, {
            include: [
                { model: Address, as: "address" }
            ]
        }) as any;

        if (!order) {
            console.log("❌ Order not found");
            return;
        }

        console.log("✅ Order Found");
        console.log("Address ID:", order.address_id);

        if (order.address) {
            console.log("✅ Address Association Found:");
            console.log(JSON.stringify(order.address, null, 2));
        } else {
            console.log("❌ Address Association is NULL");
            // Check if address exists explicitly
            if (order.address_id) {
                const address = await Address.findByPk(order.address_id);
                console.log("🔍 Manual Address Lookup:", address ? JSON.stringify(address, null, 2) : "Not Found");
            }
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await db.close();
    }
};

checkOrder();
