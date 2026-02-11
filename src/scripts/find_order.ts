import db from "../config/database";
import Transactions from "../modules/transaction/models/TransactionModel";

const findOrder = async () => {
    try {
        const invoice = "INV-1770794280778";
        const transaction = await Transactions.findOne({ where: { invoice_number: invoice } });

        if (transaction) {
            console.log(`✅ Transaction Found!`);
            console.log(`Order ID: ${transaction.order_id}`);
            console.log(`Status: ${transaction.status}`);
        } else {
            console.log(`❌ Transaction with invoice ${invoice} not found.`);
        }
    } catch (error) {
        console.error("Error finding order:", error);
    } finally {
        await db.close();
    }
};

findOrder();
