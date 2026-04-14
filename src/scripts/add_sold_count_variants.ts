import db from "../config/database";

async function addSoldCountToVariants() {
    try {
        console.log("Adding sold_count column to product_variants...");
        
        // Add column using raw query to be safe with Sequelize init
        await db.query(`
            ALTER TABLE product_variants 
            ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;
        `);

        console.log("✅ Column sold_count successfully added to product_variants!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding column:", error);
        process.exit(1);
    }
}

addSoldCountToVariants();
