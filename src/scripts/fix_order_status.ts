import db from "../config/database";
import Transactions from "../modules/transaction/models/TransactionModel";
import Orders from "../modules/order/models/OrderModel";

const fixOrder = async () => {
    try {
        const invoice = "INV-1770794280778";
        console.log(`🔍 Searching for transaction with invoice: ${invoice}`);

        const transaction = await Transactions.findOne({ where: { invoice_number: invoice } });

        if (!transaction) {
            console.log(`❌ Transaction with invoice ${invoice} not found.`);
            return;
        }

        console.log(`✅ Transaction Found! Order ID: ${transaction.order_id}`);

        const order = await Orders.findByPk(transaction.order_id);

        if (!order) {
            console.log(`❌ Order with ID ${transaction.order_id} not found.`);
            return;
        }

        console.log(`ℹ️ Current Order Status: ${order.status}`);

        if (order.status === 'processing') {
            console.log(`✅ Order is ALREADY in 'processing' status.`);
            return;
        }

        console.log(`🔄 Updating Order Status to 'processing'...`);

        try {
            order.status = 'processing';
            await order.save();
            console.log(`✅ Order status successfully updated to 'processing'!`);
        } catch (err: any) {
            console.error(`❌ Failed to update order status:`, err.message);
            if (err.message.includes("invalid input value for enum")) {
                console.log(`
⚠️  DATABASE ENUM ERROR DETECTED ⚠️
It seems the database ENUM type 'enum_orders_status' does not have 'processing' value yet.
Please runs this SQL:
ALTER TYPE "enum_orders_status" ADD VALUE 'processing';
                `);
            }
        }

    } catch (error) {
        console.error("Error in fix script:", error);
    } finally {
        await db.close();
    }
};

fixOrder();
