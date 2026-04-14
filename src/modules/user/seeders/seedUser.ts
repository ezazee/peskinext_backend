import bcrypt from "bcrypt";
import Users from "../models/UserModel";
import db from "../../../config/database";

const seedUsers = async () => {
    try {
        await db.authenticate();
        console.log("Database connected...");

        // Ensure table exists
        await Users.sync({ alter: true });

        const defaultPassword = "password123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const email = "superadmin@peskinpro.id";
        const name = "Super Admin Utama";

        const exists = await Users.findOne({ where: { email } });
        if (!exists) {
            await Users.create({
                name: name,
                email: email,
                password: hashedPassword,
                role: "super_admin",
                status: "active",
                email_verified_at: new Date(),
                firstName: "Super",
                lastName: "Admin",
                slug: "super-admin-utama",
                is_google: false
            });
            console.log(`✅ Created Super Admin: ${email} / ${defaultPassword}`);
        } else {
            exists.password = hashedPassword;
            exists.name = name;
            exists.role = "super_admin";
            exists.status = "active";
            await exists.save();
            console.log(`✅ Updated Super Admin credentials: ${email} / ${defaultPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed users:", error);
        process.exit(1);
    }
};

seedUsers();
