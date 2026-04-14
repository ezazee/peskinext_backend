import db from "../config/database";

async function fixFlashSaleColumns() {
  console.log("🛠️  Starting Flash Sale Database Fix...");
  
  try {
    // Check if column exists before adding (PostgreSQL safe way)
    await db.query(`
      ALTER TABLE flash_sales 
      ADD COLUMN IF NOT EXISTS bg_color VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bg_image_desktop TEXT,
      ADD COLUMN IF NOT EXISTS bg_image_mobile TEXT;
    `);

    console.log("✅ Flash Sale columns added successfully!");
  } catch (error) {
    console.error("❌ Failed to update database:", error);
  } finally {
    process.exit();
  }
}

fixFlashSaleColumns();
