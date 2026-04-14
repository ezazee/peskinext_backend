import db from "./config/database";
import User from "./modules/user/models/UserModel";
import Orders from "./modules/order/models/OrderModel";

async function checkUserOrders() {
    try {
        const email = "yukilirima123@gmail.com";
        const users = await User.findAll({ where: { email } });
        console.log(`Found ${users.length} users with email ${email}:`);
        
        for (const user of users) {
             const orderCount = await Orders.count({ where: { user_id: user.id } });
             console.log(`- User ID: ${user.id}, Name: ${user.name}, Role: ${user.role}, Orders: ${orderCount}`);
        }
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

checkUserOrders();
