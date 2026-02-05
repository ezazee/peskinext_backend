
import db from "../config/database";

const purgeAddresses = async () => {
    try {
        console.log("Purging all addresses (and dependent data)...");
        // Using raw query to force cascade because Orders table references Addresses
        await db.query('TRUNCATE TABLE "addresses" CASCADE;');
        console.log("All addresses have been purged successfully.");
    } catch (error) {
        console.error("Error purging addresses:", error);
    } finally {
        await db.close();
    }
};

purgeAddresses();
