import Categories from "./src/modules/article/models/CategoryModel";
import db from "./src/config/database";

async function deleteSpecificCats() {
    try {
        await db.authenticate();
        const targets = ["tools-review", "ingredients"];
        
        for (const slug of targets) {
            const cat = await Categories.findOne({ where: { slug } });
            if (cat) {
                await cat.destroy();
                console.log(`✅ Deleted category: ${slug}`);
            } else {
                console.log(`⚠️ Category not found: ${slug}`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deleteSpecificCats();
