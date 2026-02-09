import Transactions from "./models/TransactionModel";
import Orders from "../order/models/OrderModel";
import * as NotificationService from "../notification/NotificationService";

export const createTransaction = async (orderId: string, amount: number, paymentChannel: string) => {
    const transaction = await Transactions.create({
        order_id: orderId,
        invoice_number: `INV-${Date.now()}`,
        amount,
        status: "pending",
        payment_channel: paymentChannel
    });
    return transaction;
};

export const getTransactionByOrder = async (orderId: string) => {
    return await Transactions.findOne({ where: { order_id: orderId } });
};

// DOKU Callback Handler
export const handleCallback = async (data: any) => {
    console.log("🔔 DOKU Callback received:", data);

    const { invoice_number, status } = data; // Mock payload
    const transaction = await Transactions.findOne({ where: { invoice_number } });
    if (!transaction) {
        console.error("❌ Transaction not found for invoice:", invoice_number);
        throw new Error("Transaction not found");
    }

    console.log("📝 Updating transaction status from", transaction.status, "to", status);
    transaction.status = status === 'success' ? 'success' : 'failed';
    transaction.doku_response = data;
    await transaction.save();

    // 2. Transaction Status Update (Success/Failed)
    const order = await Orders.findByPk(transaction.order_id);
    if (order) {
        if (status === 'success') {
            await NotificationService.createNotification({
                user_id: order.user_id,
                title: "🎉 Pembayaran Berhasil!",
                message: `Pembayaran untuk pesanan #${order.id} telah diterima. Kami akan segera memproses pesanan Anda.`,
                type: "success",
                category: "transaction",
                status: "completed",
                actionUrl: `/orders/${order.id}`,
                metadata: { order_id: order.id, transaction_id: transaction.id }
            });
        } else if (status === 'failed') {
            await NotificationService.createNotification({
                user_id: order.user_id,
                title: "⚠️ Pembayaran Pending",
                message: `Pesanan #${order.id} menunggu pembayaran sebesar Rp${transaction.amount.toLocaleString('id-ID')}. Selesaikan segera!`,
                type: "warning",
                category: "transaction",
                status: "pending_payment",
                actionUrl: `/orders/${order.id}`,
                metadata: { order_id: order.id, transaction_id: transaction.id }
            });
        }
    }

    // Update Order Status
    if (status === 'success') {
        const order = await Orders.findByPk(transaction.order_id);
        if (order) {
            console.log("✅ Updating order status from", order.status, "to 'paid'");
            order.status = 'paid'; // Changed from 'processing' to 'paid'
            await order.save();
        }
    }

    return transaction;
};
