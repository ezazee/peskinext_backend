import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("❌ DATABASE_URL is not defined. Cek file .env kamu!");
    process.exit(1);
}

const db = new Sequelize(dbUrl, {
    dialect: "postgres",
    logging: false, // Set console.log to see SQL queries
    //   dialectOptions: {
    //       ssl: {
    //           require: true,
    //           rejectUnauthorized: false
    //       }
    //   }
});

export default db;
