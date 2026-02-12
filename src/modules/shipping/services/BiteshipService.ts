import axios from 'axios';
import Orders from '../../order/models/OrderModel';
import Product from '../../product/models/ProductModel';
import OrderItems from '../../order/models/OrderItemModel';
import Address from '../../user/models/AddressModel';
import User from '../../user/models/UserModel';

const BITESHIP_API_URL = "https://api.biteship.com/v1/orders";
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;

// Origin defaults (Should be in ENV or Config)
const ORIGIN = {
    contact_name: process.env.STORE_CONTACT_NAME || "PESkinPro Store",
    contact_phone: process.env.STORE_CONTACT_PHONE || "08123456789",
    address: process.env.STORE_ADDRESS || "Jl. Sudirman No. 1, Jakarta",
    postal_code: process.env.STORE_POSTAL_CODE || "12190" // Example Jakarta
};

export const createBiteshipOrder = async (order: Orders) => {
    try {


        if (!BITESHIP_API_KEY) {
            throw new Error("BITESHIP_API_KEY is missing");
        }

        // 1. Fetch full order details if needed (Address, Items, User)
        const fullOrder = await Orders.findByPk(order.id, {
            include: [
                { model: Address, as: 'address' },
                { model: User, as: 'user' },
                {
                    model: OrderItems,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!fullOrder) throw new Error("Order not found");

        const address = (fullOrder as any).address;
        const user = (fullOrder as any).user;
        const items = (fullOrder as any).items;

        if (!address) throw new Error("Destination address missing");

        // 2. Map Items
        const biteshipItems = items.map((item: any) => ({
            name: item.product?.name || "Unknown Product",
            quantity: item.quantity,
            weight: item.product?.weight_gr || 1000, // Default 1kg if missing
            value: item.price
        }));

        // 3. Prepare Payload
        // Note: courier_code in Biteship usually requires company + type (e.g. jne + reg)
        // Since we only have 'courier' string from Order (e.g. 'jne'), we might need to default the service type
        // or assume order.courier might contain "jne" and we default standard.
        // For Sandbox, 'jno' 'reg' is common.

        const courierCompany = fullOrder.courier ? fullOrder.courier.toLowerCase() : 'jne';
        const courierType = 'reg'; // Defaulting to REG for now as we don't store service type in OrderModel yet

        const payload = {
            origin_contact_name: ORIGIN.contact_name,
            origin_contact_phone: ORIGIN.contact_phone,
            origin_address: ORIGIN.address,
            origin_postal_code: ORIGIN.postal_code,

            destination_contact_name: address.reciver_name || user.name || "Customer",
            destination_contact_phone: address.phone_number || user.phone || "000000",
            destination_address: `${address.address}, ${address.districts}, ${address.city}, ${address.province}`,
            destination_postal_code: address.postal_code, // Biteship needs postal code to find area
            // destination_area_id: ... best to use postal code if area_id not stored

            courier_company: courierCompany,
            courier_type: courierType,
            delivery_type: "now",

            items: biteshipItems,
            note: `Order #${fullOrder.id}`
        };



        // 4. Send Request
        const response = await axios.post(BITESHIP_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${BITESHIP_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;


        if (data.success && data.id) {
            return {
                success: true,
                biteship_order_id: data.id,
                tracking_id: data.courier ? data.courier.tracking_id : null,
                courier_code: `${courierCompany}_${courierType}`, // or data.courier.company
                full_response: data
            };
        } else {
            throw new Error("Biteship success:false in response");
        }

    } catch (error: any) {
        console.error("❌ Error creating Biteship order:", error.response?.data || error.message);
        // Don't throw fatal error to avoid rolling back Payment status if shipping fails?
        // Or throw to let caller handle?
        // Requirement: "Handle error response ... logging jelas." 
        // We return null/false so caller knows it failed but payment was OK.
        return { success: false, error: error.message };
    }
};
