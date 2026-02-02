import Reviews from "../../modules/review/models/ReviewModel";
import Users from "../../modules/user/models/UserModel";
import Products from "../../modules/product/models/ProductModel";
import ProductVariants from "../../modules/product/models/ProductVariantModel";
import db from "../../config/database";
import { v4 as uuidv4 } from "uuid";

const usersData = [
    { name: "Sosiotech Demo", email: "sosiotech123@gmail.com" },
    { name: "Rina Kartika", email: "rina.kartika@example.com" },
    { name: "Budi Santoso", email: "budi.santoso@example.com" },
    { name: "Dewi Lestari", email: "dewi.lestari@example.com" },
    { name: "Siti Aminah", email: "siti.aminah@example.com" },
];

const reviewsData = [
    // CICA-B5 Toner
    { email: "sosiotech123@gmail.com", slug: "cica-b5-refreshing-toner", variant: "100ml", rating: 5, comment: "Tonernya juara! Kulit jadi adem banget.", date: "2023-01-15T08:00:00Z" },
    { email: "rina.kartika@example.com", slug: "cica-b5-refreshing-toner", variant: "50ml", rating: 4, comment: "Bagus, cuma pengiriman agak lama.", date: "2023-01-20T10:30:00Z" },
    { email: "budi.santoso@example.com", slug: "cica-b5-refreshing-toner", variant: "150ml", rating: 5, comment: "Udah botol ke-3. Ga bisa pindah ke lain hati.", date: "2023-02-05T14:20:00Z" },
    { email: "dewi.lestari@example.com", slug: "cica-b5-refreshing-toner", variant: "100ml", rating: 5, comment: "Cocok buat kulit sensitif kayak aku.", date: "2023-02-12T09:00:00Z" },
    { email: "siti.aminah@example.com", slug: "cica-b5-refreshing-toner", variant: "50ml", rating: 3, comment: "Biasa aja sih di aku, tapi ga bikin breakout.", date: "2023-02-15T16:45:00Z" },

    // Vit C Daycream
    { email: "sosiotech123@gmail.com", slug: "vit-c-tone-up-daycream-spf-50", variant: "20g", rating: 5, comment: "Tone up nya natural, ga abu-abu.", date: "2023-02-01T09:15:00Z" },
    { email: "rina.kartika@example.com", slug: "vit-c-tone-up-daycream-spf-50", variant: "40g", rating: 5, comment: "Praktis banget, udah ada SPF nya.", date: "2023-02-10T08:30:00Z" },
    { email: "budi.santoso@example.com", slug: "vit-c-tone-up-daycream-spf-50", variant: "20g", rating: 4, comment: "Agak lengket dikit awal pake, tapi lama2 nyatu.", date: "2023-02-18T13:00:00Z" },

    // Honey Cleanser
    { email: "dewi.lestari@example.com", slug: "honey-cleansing-gel", variant: "100ml", rating: 5, comment: "Wanginya enak, madu banget. Kulit ga ketarik abis cuci muka.", date: "2023-03-01T07:45:00Z" },
    { email: "siti.aminah@example.com", slug: "honey-cleansing-gel", variant: "50ml", rating: 5, comment: "Lembut banget busanya.", date: "2023-03-05T19:20:00Z" },
    { email: "sosiotech123@gmail.com", slug: "honey-cleansing-gel", variant: "150ml", rating: 4, comment: "Botolnya agak susah dipencet pas udah mau abis.", date: "2023-03-10T12:00:00Z" },

    // Facial Pad
    { email: "rina.kartika@example.com", slug: "pe-prebiotic-pore-ex-facial-pad", variant: "30 pads", rating: 5, comment: "Kotoran keangkat semua! Puas banget.", date: "2023-04-01T15:30:00Z" },
    { email: "budi.santoso@example.com", slug: "pe-prebiotic-pore-ex-facial-pad", variant: "60 pads", rating: 5, comment: "Praktis buat eksfoliasi mingguan.", date: "2023-04-05T10:10:00Z" },

    // Glow Serum
    { email: "dewi.lestari@example.com", slug: "skin-awakening-glow-serum", variant: "15ml", rating: 5, comment: "Beneran bikin glowing dong dalam 2 minggu.", date: "2023-05-01T20:00:00Z" },
    { email: "siti.aminah@example.com", slug: "skin-awakening-glow-serum", variant: "30ml", rating: 4, comment: "Lumayan mencerahkan bekas jerawat.", date: "2023-05-10T11:55:00Z" },
    { email: "sosiotech123@gmail.com", slug: "skin-awakening-glow-serum", variant: "15ml", rating: 5, comment: "Teksturnya ringan, ga lengket.", date: "2023-05-15T08:40:00Z" },

    // Hydro Cream
    { email: "rina.kartika@example.com", slug: "hydro-restorative-cream", variant: "30g", rating: 5, comment: "Lembap banget dipake malem, paginya kenyal.", date: "2023-06-01T21:30:00Z" },
    { email: "budi.santoso@example.com", slug: "hydro-restorative-cream", variant: "60g", rating: 5, comment: "Sleeping mask andalan.", date: "2023-06-05T22:15:00Z" },

    // Bundles
    { email: "dewi.lestari@example.com", slug: "paket-basic-glow-honey-cleanser-toner", variant: "Small Set", rating: 5, comment: "Paket hemat yang pas buat pemula.", date: "2023-07-01T09:00:00Z" },
    { email: "siti.aminah@example.com", slug: "paket-sun-ready-toner-daycream", variant: "Medium Set", rating: 5, comment: "Duo maut buat panas-panasan.", date: "2023-07-10T13:45:00Z" },
];

export const seedReviews = async () => {
    console.log("Seeding Reviews...");
    try {
        await db.authenticate();
        console.log("DB Connected.");

        // Force create table if missing
        await Reviews.sync({ alter: true });

        // Cleanup existing reviews to avoid duplicates
        await Reviews.destroy({ truncate: true, cascade: true });
        console.log("Old reviews cleared.");

        // Create Users
        const userMap = new Map<string, string>(); // email -> id

        for (const u of usersData) {
            let user = await Users.findOne({ where: { email: u.email } });
            if (!user) {
                try {
                    user = await Users.create({
                        id: uuidv4(),
                        name: u.name,
                        email: u.email,
                        password: "dummyhashpassword",
                        role: "user",
                        no_telp: "08123456789",
                        status: "active",
                        is_google: false
                    } as any);
                    console.log(`Created user: ${u.name}`);
                } catch (e) {
                    console.log(`User creation skipped for ${u.name}`);
                    user = await Users.findOne({ where: { email: u.email } });
                }
            }
            if (user) {
                userMap.set(u.email, user.id);
            }
        }

        // Create Reviews
        for (const r of reviewsData) {
            const userId = userMap.get(r.email);
            if (!userId) continue;

            const product = await Products.findOne({ where: { slug: r.slug } });

            if (product) {
                let variantId: number | null = null;
                if (r.variant) {
                    const v = await ProductVariants.findOne({ where: { product_id: product.id, variant_name: r.variant } });
                    if (v) variantId = v.id;
                }

                try {
                    await Reviews.create({
                        user_id: userId,
                        product_id: product.id,
                        variant_id: variantId,
                        rating: r.rating,
                        comment: r.comment,
                        images: JSON.stringify([]), // Dummy empty images for now
                        created_at: new Date(r.date)
                    } as any);
                } catch (err) {
                    console.error(`Failed to create review for ${r.slug}:`, err);
                }
            }
        }
        console.log("✅ Reviews Seeded Successfully");
        process.exit(0);

    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
};

if (require.main === module) {
    seedReviews();
}
