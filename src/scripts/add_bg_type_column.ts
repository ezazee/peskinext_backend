import db from "../config/database";

async function addBgTypeColumn() {
  console.log("🛠️  Adding 'bg_type' column to Flash Sale table...");
  
  try {
    // 1. Create the enum type first if it doesn't exist (if Postgres)
    // Actually, Sequelize handles ENUM as strings or native types depending on config.
    // For direct SQL, let's just use VARCHAR or a check constraint if we want to be safe.
    
    await db.query(`
      ALTER TABLE flash_sales 
      ADD COLUMN IF NOT EXISTS bg_type VARCHAR(20) DEFAULT 'color';
    `);

    console.log("✅ 'bg_type' column added successfully!");
  } catch (error) {
    console.error("❌ Failed to update database:", error);
  } finally {
    process.exit();
  }
}

addBgTypeColumn();
