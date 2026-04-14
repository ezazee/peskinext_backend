import Categories from "./src/modules/article/models/CategoryModel";
import db from "./src/config/database";

async function checkCategories() {
    try {
        await db.authenticate();
        const all = await Categories.findAll();
        console.log("ALL CATEGORIES IN DB:");
        console.log(JSON.stringify(all, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkCategories();
