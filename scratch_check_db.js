const db = require('./src/config/database').default;

async function checkTable() {
    try {
        const [results] = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permissions'");
        console.log("Columns in role_permissions:", results.map(r => r.column_name));
    } catch (error) {
        console.error("Error checking table:", error.message);
    } finally {
        process.exit();
    }
}

checkTable();
