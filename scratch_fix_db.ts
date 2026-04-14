import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import db from './src/config/database';

async function fixTable() {
    try {
        console.log("Checking columns for role_permissions...");
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='created_at') THEN
                    ALTER TABLE role_permissions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='updated_at') THEN
                    ALTER TABLE role_permissions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);
        console.log("✅ Columns ensured successfully.");
    } catch (error: any) {
        console.error("❌ Error fixing table:", error.message);
    } finally {
        process.exit();
    }
}

fixTable();
