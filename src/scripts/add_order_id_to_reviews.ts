/**
 * Migration script to add order_id column to reviews table
 * Run this script once to update the database schema
 */

import db from "../config/database";
import { QueryInterface, DataTypes, Op } from "sequelize";

async function migrate() {
    const queryInterface: QueryInterface = db.getQueryInterface();

    try {
        console.log("🔄 Starting migration: Add order_id to reviews table...");

        // Add order_id column
        await queryInterface.addColumn("reviews", "order_id", {
            type: DataTypes.UUID,
            allowNull: true
        });

        console.log("✅ Column 'order_id' added to 'reviews' table");

        // Add unique index with proper Op syntax
        await queryInterface.addIndex("reviews", {
            fields: ["user_id", "product_id", "order_id", "variant_id"],
            unique: true,
            name: "unique_review_per_order_item",
            where: {
                order_id: { [Op.ne]: null }
            }
        });

        console.log("✅ Unique index 'unique_review_per_order_item' created");
        console.log("✨ Migration completed successfully!");

        process.exit(0);
    } catch (error: any) {
        console.error("❌ Migration failed:", error.message);

        // Check if error is "column already exists" or "index already exists"
        if (error.message?.includes("Duplicate column name") ||
            error.message?.includes("Duplicate key name") ||
            error.message?.includes("already exists")) {
            console.log("ℹ️  Resources already exist. Skipping...");
            process.exit(0);
        }

        process.exit(1);
    }
}

migrate();
