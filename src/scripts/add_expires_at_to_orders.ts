
import db from "../config/database";

const addExpiresAtToOrders = async () => {
    try {
        console.log("Adding expires_at column to orders table...");
        const tableDetails = await db.getQueryInterface().describeTable("orders");

        if (!tableDetails["expires_at"]) {
            await db.getQueryInterface().addColumn("orders", "expires_at", {
                type: "TIMESTAMP",
                allowNull: true,
            });
            console.log("✅ Column 'expires_at' added successfully.");
        } else {
            console.log("⚠️ Column 'expires_at' already exists.");
        }
    } catch (error) {
        console.error("❌ Error adding column:", error);
    } finally {
        await db.close();
    }
};

addExpiresAtToOrders();
