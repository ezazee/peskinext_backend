import Invoices from "./models/InvoiceModel";
import Orders from "../order/models/OrderModel";

export const generateInvoice = async (orderId: string) => {
    const order = await Orders.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    const invoice = await Invoices.create({
        order_id: orderId,
        invoice_number: `INV-${Date.now()}`,
        subtotal: order.total_amount, // Simplified
        tax: 0,
        discount: order.discount,
        total: order.total_amount,
        status: "unpaid"
    } as any);

    return invoice;
};

export const getInvoiceByOrder = async (orderId: string) => {
    return await Invoices.findOne({ where: { order_id: orderId } });
};
