import bcrypt from "bcrypt";
import Users from "../models/UserModel";
import db from "../../../config/database";

const seedUsers = async () => {
    try {
        await db.authenticate();
        console.log("Database connected...");

        // Ensure table exists
        await Users.sync({ alter: true });

        // Admin User
        const adminEmail = "admin@example.com";
        const adminExists = await Users.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await Users.create({
                name: "Admin User",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                status: "active",
                email_verified_at: new Date(),
                no_telp: "081234567890",
                firstName: "Admin",
                lastName: "User",
                slug: "admin-user",
                is_google: false
            });
            console.log("✅ Admin user created: admin@example.com / password123");
        } else {
            console.log("⚠️ Admin user already exists.");
        }

        // Regular User
        const userEmail = "user@example.com";
        const userExists = await Users.findOne({ where: { email: userEmail } });

        if (!userExists) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await Users.create({
                name: "Regular User",
                email: userEmail,
                password: hashedPassword,
                role: "user",
                status: "active",
                email_verified_at: new Date(),
                no_telp: "089876543210",
                firstName: "Regular",
                lastName: "User",
                slug: "regular-user",
                is_google: false
            });
            console.log("✅ Regular user created: user@example.com / password123");
        } else {
            console.log("⚠️ Regular user already exists.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed users:", error);
        process.exit(1);
    }
};

seedUsers();
