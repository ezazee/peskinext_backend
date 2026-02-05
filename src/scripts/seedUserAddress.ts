
import dotenv from "dotenv";
import Address from "../modules/user/models/AddressModel";
import Users from "../modules/user/models/UserModel";

dotenv.config();

(async () => {
    try {
        console.log("🌱 Seeding Default Addresses for Users...");
        const users = await Users.findAll();

        if (users.length === 0) {
            console.log("❌ No users found to seed.");
            process.exit(0);
        }

        for (const u of users) {
            const user = u as any;

            // Check if user already has an address
            const existing = await Address.findOne({ where: { user_id: user.id } });

            if (!existing) {
                console.log(`Adding address for ${user.first_name}...`);
                await Address.create({
                    user_id: user.id,
                    label: "Rumah",
                    address: "Jl. Jendral Sudirman No. 1",
                    province: "DKI Jakarta",
                    regencies: "Jakarta Pusat",
                    districts: "Tanah Abang",
                    villages: "Gelora",
                    postal_code: "10270", // Biteship: IDnP6811 (South Jakarta) or similar. 10270 is Central Jakarta.
                    is_default: true
                });
            } else {
                console.log(`User ${user.first_name} already has an address.`);
                // Ensure at least one is default
                const defaultAddr = await Address.findOne({ where: { user_id: user.id, is_default: true } });
                if (!defaultAddr) {
                    await existing.update({ is_default: true });
                    console.log(`   -> Set existing address as default.`);
                }
            }
        }

        console.log("✅ Seeding Addresses Completed.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
})();
