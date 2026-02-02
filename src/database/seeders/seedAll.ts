import db from "../../config/database";
import { execSync } from "child_process";

const runSeed = async () => {
    try {
        console.log("🔥 PURGING DATABASE (Force Sync)...");
        await db.authenticate();
        // Force sync drops all tables and recreates them based on models
        await db.sync({ force: true });
        console.log("✅ Database Purged & Synced.");

        console.log("🌱 STARTING SEEDERS...");

        const scripts = [
            "src/modules/user/seeders/seedUser.ts",
            "src/modules/product/seeders/seedProduct.ts",
            "src/database/seeders/seedCoupons.ts",
            "src/database/seeders/seedBanners.ts",
            "src/database/seeders/seedReviews.ts"
        ];

        for (const script of scripts) {
            console.log(`\n👉 Running ${script}...`);
            // Run via ts-node, inheriting stdio to see logs
            execSync(`npx ts-node ${script}`, { stdio: "inherit" });
        }

        console.log("\n✅✅ ALL SEEDS COMPLETED SUCCESSFULLY!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seed Failed:", error);
        process.exit(1);
    }
};

runSeed();
