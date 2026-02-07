import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { syncDB } from "./database/migrations/migrate";

const PORT = process.env.PORT || 3000;

(async () => {
    await syncDB();
    // @ts-ignore
    app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`🚀 Server running at port ${PORT}`);
    });
})();
