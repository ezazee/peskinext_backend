import db from "../config/database";
import Users from "../modules/user/models/UserModel";
import Categories from "../modules/article/models/CategoryModel";
import Posts from "../modules/article/models/PostModel";
import PostImages from "../modules/article/models/PostImageModel";
import slugify from "slugify";

const skincarePosts = [
    // --- TIPS SKINCARE (3 Posts) ---
    {
        title: "Urutan Skincare Pagi yang Benar untuk Pemula",
        category: "Tips Skincare",
        content: "<p>Masih bingung urutan pakai skincare? Simak panduan simple ini: Cleanser > Toner > Serum > Moisturizer > Sunscreen. Jangan sampai terbalik ya!</p>",
        image: "https://placehold.co/800x450/dbeafe/1e40af?text=Skincare+Routine",
    },
    {
        title: "Kenapa Wajib Pakai Sunscreen Tiap Hari?",
        category: "Tips Skincare",
        content: "<p>Sinar UV adalah musuh utama kulit awet muda. Pakai sunscreen minimal SPF 30 setiap pagi, bahkan saat mendung atau di dalam ruangan.</p>",
        image: "https://placehold.co/800x450/ffedd5/9a3412?text=Sunscreen+Guide",
    },
    {
        title: "Cara Mengetahui Jenis Kulit Wajah Kamu",
        category: "Tips Skincare",
        content: "<p>Oily, dry, atau kombinasi? Cek dengan cara cuci muka, tunggu 30 menit tanpa produk apapun, lalu tempelkan blazter minyak. Lihat hasilnya di sini.</p>",
        image: "https://placehold.co/800x450/fae8ff/86198f?text=Skin+Type",
    },

    // --- DAILY ROUTINE (3 Posts) ---
    {
        title: "Night Routine Simple yang Bikin Glowing Besok Pagi",
        category: "Daily Routine",
        content: "<p>Gak perlu 10 step skincare ala Korea kalau kamu sibuk. Cukup 3-4 step basic night routine ini: Double Cleansing > Hydrating Toner > Night Cream.</p>",
        image: "https://placehold.co/800x450/f3e8ff/6b21a8?text=Night+Routine",
    },
    {
        title: "Morning Routine untuk Kulit Berminyak",
        category: "Daily Routine",
        content: "<p>Punya kulit berminyak? Fokus pada hidrasi ringan dan proteksi. Gunakan gel cleanser dan sunscreen matte finish agar bebas kilap seharian.</p>",
        image: "https://placehold.co/800x450/ecfccb/3f6212?text=Oily+Skin+Routine",
    },
    {
        title: "Weekly Routine: Eksfoliasi & Maskeran",
        category: "Daily Routine",
        content: "<p>Jangan lupa eksfoliasi 2x seminggu untuk angkat sel kulit mati. Lanjutkan dengan sheet mask untuk calming dan extra hydration.</p>",
        image: "https://placehold.co/800x450/ffe4e6/9f1239?text=Weekly+Exfoliation",
    },

    // --- EDUKASI AFFILIATOR (3 Posts) ---
    {
        title: "Cara Cuan Jutaan Rupiah dari Affiliate Skincare",
        category: "Edukasi Affiliator",
        content: "<p>Mau dapat penghasilan tambahan tanpa modal? Yuk gabung jadi affiliator PE Skin Pro! Komisi besar, produk laris, dan support konten lengkap.</p>",
        image: "https://placehold.co/800x450/ccfbf1/115e59?text=Affiliate+Cuan",
    },
    {
        title: "5 Ide Konten TikTok yang Bikin Keranjang Kuning Laris",
        category: "Edukasi Affiliator",
        content: "<p>Bingung mau posting apa? Coba konten: Review Jujur, Before-After, A Day in My Life, atau ASMR Texture Shot. Dijamin FYP!</p>",
        image: "https://placehold.co/800x450/fff7ed/9a3412?text=TikTok+Ideas",
    },
    {
        title: "Strategi Copywriting untuk Caption Instagram Affiliate",
        category: "Edukasi Affiliator",
        content: "<p>Caption jangan cuma jualan! Pakai teknik storytelling dan formula AIDA (Attention, Interest, Desire, Action) biar followers terhipnotis buat checkout.</p>",
        image: "https://placehold.co/800x450/e0e7ff/3730a3?text=Copywriting+Tips",
    }
];

const seedBlog = async () => {
    try {
        await db.authenticate();
        console.log("✅ Database connected...");

        // 1. Get Admin User
        const admin = await Users.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.error("❌ Admin user not found. Please run 'npm run seedUser' first.");
            process.exit(1);
        }
        console.log(`👤 Using Author: ${admin.name} (${admin.id})`);

        // 2. Seed Categories
        const categoriesMap: Record<string, number> = {};
        const categories = ["Tips Skincare", "Daily Routine", "Edukasi Affiliator"];

        for (const catName of categories) {
            const [cat] = await Categories.findOrCreate({
                where: { slug: slugify(catName, { lower: true }) },
                defaults: {
                    name: catName,
                    slug: slugify(catName, { lower: true }),
                    parent_id: null
                }
            });
            categoriesMap[catName] = cat.id;
        }
        console.log("✅ Categories seeded:", Object.keys(categoriesMap));

        // 3. Seed Posts (15 per category)
        const TARGET_PER_CATEGORY = 15;

        for (const catName of categories) {
            // Get templates for this category
            const templates = skincarePosts.filter(p => p.category === catName);

            if (templates.length === 0) continue;

            const categoryId = categoriesMap[catName];
            console.log(`📚 Seeding ${TARGET_PER_CATEGORY} posts for: ${catName}`);

            for (let i = 0; i < TARGET_PER_CATEGORY; i++) {
                // Cycle through templates
                const template = templates[i % templates.length];

                // Add suffix for duplicates to keep titles unique
                // First loop (0-2) uses original title
                // Subsequent loops use "Part 2", "Part 3", etc. or just "Vol X"
                const iteration = Math.floor(i / templates.length) + 1;
                const suffix = iteration > 1 ? ` (Vol. ${iteration})` : "";

                const title = `${template.title}${suffix}`;
                const slug = slugify(title, { lower: true, strict: true });

                // Check if post exists
                let post = await Posts.findOne({ where: { slug } });

                if (!post) {
                    post = await Posts.create({
                        title: title,
                        slug: slug,
                        content: template.content,
                        category_id: categoryId,
                        user_id: admin.id,
                    });
                    // console.log(`   + Created: ${title}`);

                    // 4. Create Image
                    await PostImages.create({
                        post_id: post.id,
                        image_url: template.image,
                        alt_text: title
                    });
                } else {
                    // console.log(`   = Exists: ${title}`);
                }
            }
        }

        console.log("🎉 Blog Seeding Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedBlog();

