
import dotenv from "dotenv";
import Address from "../modules/user/models/AddressModel";
import Users from "../modules/user/models/UserModel";

dotenv.config();

(async () => {
    try {
        console.log("🔍 Debugging User Addresses...");
        const users = await Users.findAll({
            include: [
                { model: Address, as: "addresses" }
            ]
        });

        if (users.length === 0) {
            console.log("❌ No users found!");
        } else {
            users.forEach((u: any) => {
                console.log(`\nUser: ${u.first_name} ${u.last_name} (${u.id})`);
                if (u.addresses && u.addresses.length > 0) {
                    u.addresses.forEach((a: any) => {
                        console.log(`   - [${a.is_default ? "DEFAULT" : "   "}] ${a.address}, ${a.subdistrict}, ${a.city} (ID: ${a.id})`);
                    });
                } else {
                    console.log("   ❌ No addresses found for this user.");
                }
            });
        }
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
})();
