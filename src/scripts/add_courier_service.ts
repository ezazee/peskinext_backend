
import db from "../config/database";

const addCourierService = async () => {
    try {
        await db.query(`ALTER TABLE orders ADD COLUMN courier_service VARCHAR(255);`);
        console.log("✅ Successfully added 'courier_service' column to 'orders' table.");
    } catch (error: any) {
        if (error.message && error.message.includes("duplicate column name")) {
            console.log("ℹ️ Column 'courier_service' already exists.");
        } else {
            console.error("❌ Error adding column:", error);
        }
    } finally {
        await db.close();
    }
};

addCourierService();
