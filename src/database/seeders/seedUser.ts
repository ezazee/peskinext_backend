import Users from "../../modules/user/models/UserModel";
import bcrypt from "bcrypt";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

const seedUser = async () => {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);

        const users = [
            {
                id: uuidv4(),
                first_name: "Admin",
                last_name: "User",
                name: "Admin User",
                email: "admin@example.com",
                no_telp: "081234567890",
                password: hashedPassword,
                role: "admin",
                status: "active",
                slug: slugify("Admin User", { lower: true }),
                affiliate_status: "none"
            },
            {
                id: uuidv4(),
                first_name: "John",
                last_name: "Doe",
                name: "John Doe",
                email: "user@example.com",
                no_telp: "081234567891",
                password: hashedPassword,
                role: "user",
                status: "active",
                slug: slugify("John Doe", { lower: true }),
                affiliate_status: "none"
            },
            {
                id: uuidv4(), // Stable ID for "sosiotech123@gmail.com" logic if we wanted, but random is fine for new Backend
                first_name: "Reza",
                last_name: "Dev",
                name: "Reza Dev",
                email: "sosiotech123@gmail.com",
                no_telp: "6281313711180",
                password: hashedPassword,
                role: "user",
                status: "active",
                slug: slugify("Reza Dev", { lower: true }),
                affiliate_status: "none",
                is_plus_member: false,
                is_safe_mode: false,
                birth_date: "2002-06-24"
            }
        ];

        // @ts-ignore
        await Users.bulkCreate(users);
        console.log("✅ Users seeded successfully with UUIDs");
    } catch (error) {
        console.error("❌ Failed to seed users:", error);
    }
};

export default seedUser;

if (require.main === module) {
    seedUser();
}
