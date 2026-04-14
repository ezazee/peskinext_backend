import dotenv from "dotenv";
dotenv.config();
console.log("Environment loaded. CORS_ORIGINS:", process.env.CORS_ORIGINS);

// Sentry Instrument MUST be imported before everything else
import "./instrument";

import app from "./app";
import { syncDB } from "./database/migrations/migrate";
import { seedInitialSettings } from "./modules/setting/SettingService";
import { seedBanners } from "./database/seeders/seedBanners";

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await syncDB();
        
        // DISABLED ON BOOT: Takes ~30 seconds causing cloud proxy timeouts (Leapcell 9.8s limit).
        // Settings are already seeded in the database anyway. Use npm run seedAll if needed.
        // await seedInitialSettings();

        // app.listen
        // @ts-ignore
        app.listen(Number(PORT), "0.0.0.0", () => {
            console.log(`🚀 Server running at port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Fatal error during server startup:", error);
        process.exit(1);
    }
})();
