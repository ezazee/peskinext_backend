import db from "../config/database";
import bcrypt from "bcrypt";
import { seedInitialSettings } from "../modules/setting/SettingService";

// Import Models to ensure sync works
import Users from "../modules/user/models/UserModel";
import RolePermissions from "../modules/user/models/RolePermissionModel";
import Products from "../modules/product/models/ProductModel";
import ProductVariants from "../modules/product/models/ProductVariantModel";
import ProductVariantPrices from "../modules/product/models/ProductVariantPriceModel";
import ProductStocks from "../modules/product/models/ProductStockModel";
import ProductImages from "../modules/product/models/ProductImageModel";
import "../modules/user/models/AddressModel";
import "../modules/coupon/models/CouponModel";
import "../modules/cart/models/CartModel";
import "../modules/order/models/OrderModel";
import "../modules/order/models/OrderItemModel";
import "../modules/order/models/OrderStatusHistoryModel";
import "../modules/transaction/models/TransactionModel";
import "../modules/shipping/models/ShippingMethodModel";
import "../modules/review/models/ReviewModel";
import "../modules/invoice/models/InvoiceModel";
import "../modules/article/models/CategoryModel";
import "../modules/article/models/TagModel";
import "../modules/article/models/PostModel";
import "../modules/article/models/PostImageModel";
import "../modules/wilayah/models/ProvinceModel";
import "../modules/wilayah/models/DistrictModel";
import "../modules/wilayah/models/RegencyModel";
import "../modules/wilayah/models/VillageModel";
import "../modules/banner/models/BannerModel";
import "../modules/setting/models/SettingModel";
import "../modules/faq/models/FAQModel";
import "../modules/flash-sale/models/FlashSaleModel";
import "../modules/flash-sale/models/FlashSaleItemModel";

async function purgeAndSeed() {
    console.log("💣 Starting Minimal Production Purge...");

    try {
        // FORCE SYNC: DROPS ALL TABLES
        await db.sync({ force: true });
        console.log("✅ All tables dropped and recreated (EMPTY).");

        // 1. Seed Minimal Settings
        console.log("🌱 Seeding essential settings...");
        await seedInitialSettings();

        // 2. Create Default Roles (RolePermissions)
        console.log("🛡️  Seeding default roles...");
        await RolePermissions.bulkCreate([
            {
                role: "super_admin",
                name: "Super Admin",
                color: "#8b5cf6",
                permissions: ["*"]
            },
        ]);
        console.log("✅ Default roles created.");

        // 3. Create Single Superadmin
        console.log("👤 Creating Superadmin...");
        const hashedPassword = await bcrypt.hash("password123", 10);
        await Users.create({
            name: "PE Skinpro Superadmin",
            email: "superadmin@peskinpro.id",
            password: hashedPassword,
            role: "super_admin",
            status: "active"
        });
        console.log("✅ Admin created: superadmin@peskinpro.id / password123");




        // 3. Create All 7 Single Products (No Bundles)
        console.log("📦 Seeding all 7 single products...");
        const products = [
            {
                name: "CICA-B5 Refreshing Toner",
                slug: "cica-b5-refreshing-toner",
                sku: "CICA-B5-001",
                price: 160000,
                category: "Skincare",
                desc: "CICA Refreshing Toner membantu menghidrasi, menyejukkan, dan memperbaiki kondisi kulit Anda."
            },
            {
                name: "Vit C Tone-Up Daycream SPF 50",
                slug: "vit-c-tone-up-daycream-spf-50",
                sku: "VIT-C-DAY-001",
                price: 185000,
                category: "Skincare",
                desc: "Daycream dengan SPF 50 yang mencerahkan dan melindungi kulit dari sinar UV."
            },
            {
                name: "Honey Cleansing Gel",
                slug: "honey-cleansing-gel",
                sku: "HONEY-003",
                price: 160000,
                category: "Skincare",
                desc: "Gel pembersih wajah dengan ekstrak madu yang membersihkan tanpa mengeringkan kulit."
            },
            {
                name: "PE Prebiotic Pore-EX Facial Pad",
                slug: "pe-prebiotic-pore-ex-facial-pad",
                sku: "PE-PAD-004",
                price: 160000,
                category: "Skincare",
                desc: "Pad eksfoliasi dengan prebiotik untuk membersihkan pori-pori dan mengangkat sel kulit mati."
            },
            {
                name: "Hydro Restorative Cream",
                slug: "hydro-restorative-cream",
                sku: "HYDRO-005",
                price: 160000,
                category: "Skincare",
                desc: "Krim pelembap yang menghidrasi dan menenangkan kulit dengan ekstrak alami."
            },
            {
                name: "Skin Awakening Glow Serum",
                slug: "skin-awakening-glow-serum",
                sku: "GLOW-006",
                price: 160000,
                category: "Skincare",
                desc: "Serum pencerah yang memberikan kilau alami pada kulit dengan bahan aktif."
            },
            {
                name: "Intimate Feminine Mousse Cleanser",
                slug: "intimate-feminine-mousse-cleanser",
                sku: "INTIMATE-007",
                price: 160000,
                category: "Intimate Care",
                desc: "Pembersih intim berbentuk mousse yang lembut dan menyejukkan."
            }
        ];

        for (const p of products) {
            const product = await Products.create({
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                category: p.category,
                type: "single",
                status: "active",
                weight_gr: 100,
                description: p.desc
            } as any);

            const variant = await ProductVariants.create({
                product_id: product.id,
                variant_name: "Default",
                weight: "100"
            });

            await ProductVariantPrices.create({
                variant_id: variant.id,
                channel: "default",
                price: p.price,
                price_strikethrough: p.price + 20000
            });

            await ProductStocks.create({
                product_id: product.id,
                variant_id: variant.id,
                channel: "default",
                qty: 100,
                tanggal_masuk: new Date(),
                tanggal_expired: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                status: "noexpired"
            });

            console.log(`✅ Product created: ${p.name}`);
        }

        console.log("\n✨ PURGE COMPLETE. Database is now clean with 1 Admin and 7 Single Products.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Purge failed:", error);
        process.exit(1);
    }
}


purgeAndSeed();
