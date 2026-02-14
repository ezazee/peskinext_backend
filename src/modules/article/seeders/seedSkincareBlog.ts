import db from "../../../config/database";
import Users from "../../user/models/UserModel";
import Categories from "../models/CategoryModel";
import Posts from "../models/PostModel";
import PostImages from "../models/PostImageModel";
import slugify from "slugify";

const skincarePosts = [
    {
        title: "Urutan Skincare Pagi yang Benar untuk Pemula",
        category: "Daily Routine",
        content: "Banyak pemula yang bingung dengan urutan skincare pagi. Mulai dari facial wash, toner, serum, pelembab, hingga sunscreen. Simak panduan lengkapnya di sini...",
        image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Morning+Routine",
    },
    {
        title: "Manfaat Niacinamide untuk Mencerahkan Wajah",
        category: "Ingredients",
        content: "Niacinamide adalah bahan ajaib yang ampuh mencerahkan kulit lho! Selain itu, bisa juga menyamarkan noda hitam bekas jerawat. Yuk kenalan lebih jauh...",
        image: "https://placehold.co/800x450/fce7f3/831843?text=Niacinamide",
    },
    {
        title: "Cara Mengatasi Jerawat Hormonal Saat Haid",
        category: "Tips Skincare",
        content: "Jerawat sering muncul saat mendekati siklus bulanan? Jangan panik, itu wajar kok. Ada beberapa cara alami dan skincare routine khusus untuk menanganinya.",
        image: "https://placehold.co/800x450/fee2e2/991b1b?text=Acne+Tips",
    },
    {
        title: "5 Kesalahan Pakai Sunscreen yang Bikin Kusam",
        category: "Tips Skincare",
        content: "Sudah pakai sunscreen tapi kulit malah kusam atau terbakar? Mungkin cara pakainya masih kurang tepat. Cek 5 kesalahan umum ini!",
        image: "https://placehold.co/800x450/fef3c7/92400e?text=Sunscreen+Mistakes",
    },
    {
        title: "Retinol: Kapan Harus Mulai Pakai?",
        category: "Ingredients",
        content: "Anti-aging terbaik adalah Retinol. Tapi kapan usia yang tepat untuk mulai? Dan bagaimana cara pakainya agar tidak iritasi? Baca selengkapnya.",
        image: "https://placehold.co/800x450/e0e7ff/3730a3?text=Retinol+Guide",
    },
    {
        title: "Double Cleansing: Rahasia Kulit Bersih Bebas Komedo",
        category: "Daily Routine",
        content: "Cuma cuci muka pakai sabun aja gak cukup lho, Bestie! Double cleansing pakai oil/balm cleansing itu wajib banget buat angkat sisa makeup dan debu.",
        image: "https://placehold.co/800x450/dcfce7/166534?text=Double+Cleansing",
    },
    {
        title: "Kenapa Kulit Berminyak Perlu Moisturizer?",
        category: "Tips Skincare",
        content: "Mitos salah kaprah: kulit berminyak gak butuh pelembab. Padahal, kalau kulit dehidrasi, minyak malah makin banjir lho! Ini penjelasannya.",
        image: "https://placehold.co/800x450/cffafe/155e75?text=Oily+Skin+Tips",
    },
    {
        title: "Review Jujur: Serum Vitamin C Lokal Terbaik",
        category: "Tools & Review",
        content: "Suka bingung pilih serum Vitamin C? Tim kami sudah cobain 5 produk lokal hits dan ini dia review jujurnya. Mana yang paling worth it?",
        image: "https://placehold.co/800x450/ffedd5/9a3412?text=Vitamin+C+Review",
    },
    {
        title: "Exfoliasi: Chemical vs Physical, Mana Lebih Bagus?",
        category: "Tips Skincare",
        content: "Scrub atau toner peeling? Dua-duanya punya fungsi beda buat angkat sel kulit mati. Cari tahu mana yang cocok buat jenis kulitmu.",
        image: "https://placehold.co/800x450/f1f5f9/475569?text=Exfoliation+101",
    },
    {
        title: "Night Routine Simple yang Bikin Glowing Besok Pagi",
        category: "Daily Routine",
        content: "Gak perlu 10 step skincare ala Korea kalau kamu sibuk. Cukup 3-4 step basic night routine ini, dijamin bangun tidur kulit auto glowing.",
        image: "https://placehold.co/800x450/fae8ff/86198f?text=Night+Routine",
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
        const categories = ["Tips Skincare", "Daily Routine", "Ingredients", "Tools & Review"];

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

        // 3. Seed Posts
        for (const postData of skincarePosts) {
            const slug = slugify(postData.title, { lower: true, strict: true });

            // Check if post exists
            let post = await Posts.findOne({ where: { slug } });

            if (!post) {
                post = await Posts.create({
                    title: postData.title,
                    slug: slug,
                    content: postData.content,
                    category_id: categoriesMap[postData.category],
                    user_id: admin.id,
                });
                console.log(`📝 Created Post: ${postData.title}`);

                // 4. Create Image
                await PostImages.create({
                    post_id: post.id,
                    image_url: postData.image,
                    alt_text: postData.title
                });
            } else {
                console.log(`⚠️ Post already exists: ${postData.title}`);
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
