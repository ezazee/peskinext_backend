import Products from "../models/ProductModel";
import ProductVariants from "../models/ProductVariantModel";
import ProductImages from "../models/ProductImageModel";
import ProductVariantPrices from "../models/ProductVariantPriceModel";
import ProductStocks from "../models/ProductStockModel";
import db from "../../../config/database";

const productsData = [
    // --- 7 Produk Satuan ---
    {
        name: "CICA-B5 Refreshing Toner",
        slug: "cica-b5-refreshing-toner",
        description: "CICA Refreshing Toner adalah produk perawatan kulit yang dirancang untuk memberikan sensasi segar dan menenangkan pada kulit Anda. Dengan kandungan bahan-bahan alami dan aktif yang dipilih secara teliti, toner ini membantu menghidrasi, menyejukkan, dan memperbaiki kondisi kulit Anda",
        ingredients: ["Centella Asiatica", "Hyaluronic Acid", "Vitamin B5"],
        howToUse: ["Tuangkan toner ke kapas", "Usapkan lembut ke wajah", "Gunakan pagi dan malam"],
        category: "Skincare",
        sku: "CICA-B5-001",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Refreshing+Toner",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=CICA-B5+Refreshing+Toner",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Refreshing+Toner+DETAIL",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=CICA-B5+Refreshing+Toner+DETAIL",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Toner+DETAIL",
        ],
        isFlashSale: true,
        type: "single",
        isEvent: false,
        weightGr: 50,
        soldCount: 1200,
        variants: [
            { name: "50ml", price: 144000, oldPrice: 160000, stock: 120 },
            { name: "100ml", price: 270000, oldPrice: 300000, stock: 90 },
            { name: "150ml", price: 390000, oldPrice: 430000, stock: 60 },
            { name: "200ml", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    {
        name: "Vit C Tone-Up Daycream SPF 50",
        slug: "vit-c-tone-up-daycream-spf-50",
        description: "Daycream dengan SPF 50 yang mencerahkan dan melindungi kulit dari sinar UV.",
        ingredients: ["Vitamin C", "Niacinamide", "SPF 50"],
        howToUse: ["Oleskan secukupnya ke wajah", "Gunakan setiap pagi", "Hindari kontak dengan mata"],
        category: "Skincare",
        sku: "VIT-C-002",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Vit+C+Tone-Up+Daycream+SPF+50",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Vit+C+Tone-Up+Daycream+SPF+50",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Vit+C+Tone-Up+Daycream+SPF+50",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Daycream+SPF+50",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Vitamin+C+Daycream",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 20,
        soldCount: 850,
        variants: [
            { name: "20g", price: 144000, oldPrice: 160000, stock: 100 },
            { name: "40g", price: 270000, oldPrice: 300000, stock: 80 },
            { name: "60g", price: 390000, oldPrice: 430000, stock: 50 },
            { name: "80g", price: 500000, oldPrice: 550000, stock: 30 },
        ],
    },
    {
        name: "Honey Cleansing Gel",
        slug: "honey-cleansing-gel",
        description: "Gel pembersih wajah dengan ekstrak madu yang membersihkan tanpa mengeringkan kulit.",
        ingredients: ["Honey Extract", "Aloe Vera", "Gentle Surfactants"],
        howToUse: ["Basahi wajah", "Tuangkan gel ke telapak tangan", "Pijat lembut ke wajah", "Bilas dengan air"],
        category: "Skincare",
        sku: "HONEY-003",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Honey+Cleansing+Gel",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Honey+Cleansing+Gel",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Honey+Cleansing+Gel",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Cleansing+Gel",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Honey+Cleanser",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 50,
        soldCount: 2000,
        variants: [
            { name: "50ml", price: 144000, oldPrice: 160000, stock: 150 },
            { name: "100ml", price: 270000, oldPrice: 300000, stock: 100 },
            { name: "150ml", price: 390000, oldPrice: 430000, stock: 70 },
            { name: "200ml", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    {
        name: "PE Prebiotic Pore-EX Facial Pad",
        slug: "pe-prebiotic-pore-ex-facial-pad",
        description: "Pad eksfoliasi dengan prebiotik untuk membersihkan pori-pori dan mengangkat sel kulit mati.",
        ingredients: ["Prebiotic Complex", "Salicylic Acid", "Willow Bark Extract"],
        howToUse: ["Gunakan pad pada wajah yang bersih", "Pijat lembut ke area berminyak", "Buang pad setelah digunakan"],
        category: "Skincare",
        sku: "PE-PAD-004",
        front_image: "https://placehold.co/600x600/1e3a8a/ffffff?text=Prebiotic+Pore-EX+Facial+Pad",
        back_image: "https://placehold.co/600x600/3b82f6/ffffff?text=Prebiotic+Pore-EX+Facial+Pad",
        galleryImages: [
            "https://placehold.co/600x600/1e3a8a/ffffff?text=Prebiotic+Pore-EX+Facial+Pad",
            "https://placehold.co/600x600/3b82f6/ffffff?text=Pore-EX+Pad",
            "https://placehold.co/600x600/1e3a8a/ffffff?text=Exfoliating+Pad",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 150,
        soldCount: 500,
        variants: [
            { name: "30 pads", price: 144000, oldPrice: 160000, stock: 110 },
            { name: "60 pads", price: 270000, oldPrice: 300000, stock: 90 },
            { name: "90 pads", price: 390000, oldPrice: 430000, stock: 60 },
            { name: "120 pads", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    {
        name: "Hydro Restorative Cream",
        slug: "hydro-restorative-cream",
        description: "Krim pelembap yang menghidrasi dan menenangkan kulit dengan ekstrak alami.",
        ingredients: ["Hyaluronic Acid", "Shea Butter", "Chamomile Extract"],
        howToUse: ["Oleskan secukupnya ke wajah", "Gunakan pagi dan malam", "Hindari area mata"],
        category: "Skincare",
        sku: "HYDRO-005",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Hydro+Restorative+Cream",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Hydro+Restorative+Cream",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Hydro+Restorative+Cream",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Hydro+Cream",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Restorative+Cream",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 30,
        soldCount: 900,
        variants: [
            { name: "30g", price: 144000, oldPrice: 160000, stock: 120 },
            { name: "60g", price: 270000, oldPrice: 300000, stock: 90 },
            { name: "90g", price: 390000, oldPrice: 430000, stock: 60 },
            { name: "120g", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    {
        name: "Skin Awakening Glow Serum",
        slug: "skin-awakening-glow-serum",
        description: "Serum pencerah yang memberikan kilau alami pada kulit dengan bahan aktif.",
        ingredients: ["Niacinamide", "Vitamin C", "Hyaluronic Acid"],
        howToUse: ["Oleskan beberapa tetes ke wajah", "Pijat lembut hingga meresap", "Gunakan pagi dan malam"],
        category: "Skincare",
        sku: "GLOW-006",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Skin+Awakening+Glow+Serum",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Glow+Serum",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Skin+Awakening+Glow+Serum",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Glow+Serum",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Awakening+Serum",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 15,
        soldCount: 1500,
        variants: [
            { name: "15ml", price: 144000, oldPrice: 160000, stock: 150 },
            { name: "30ml", price: 270000, oldPrice: 300000, stock: 100 },
            { name: "50ml", price: 390000, oldPrice: 430000, stock: 70 },
            { name: "75ml", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    {
        name: "Intimate Feminine Mousse Cleanser",
        slug: "intimate-feminine-mousse-cleanser",
        description: "Pembersih intim berbentuk mousse yang lembut dan menyejukkan.",
        ingredients: ["Chamomile Extract", "Aloe Vera", "Gentle Surfactants"],
        howToUse: ["Kocok mousse secukupnya", "Oleskan lembut ke area intim", "Bilas dengan air"],
        category: "Intimate Care",
        sku: "INTIMATE-007",
        front_image: "https://placehold.co/600x600/f59e0b/ffffff?text=Intimate+Feminine+Mousse+Cleanser",
        back_image: "https://placehold.co/600x600/fbbf24/111111?text=Intimate+Feminine+Mousse+Cleanser",
        galleryImages: [
            "https://placehold.co/600x600/f59e0b/ffffff?text=Intimate+Feminine+Mousse+Cleanser",
            "https://placehold.co/600x600/fbbf24/111111?text=Intimate+Cleanser",
            "https://placehold.co/600x600/f59e0b/ffffff?text=Mousse+Cleanser",
        ],
        isFlashSale: false,
        type: "single",
        isEvent: false,
        weightGr: 50,
        soldCount: 300,
        variants: [
            { name: "50ml", price: 144000, oldPrice: 160000, stock: 130 },
            { name: "100ml", price: 270000, oldPrice: 300000, stock: 90 },
            { name: "150ml", price: 390000, oldPrice: 430000, stock: 60 },
            { name: "200ml", price: 500000, oldPrice: 550000, stock: 40 },
        ],
    },
    // --- 5 Produk Bundle ---
    {
        name: "Paket Basic Glow (Honey Cleansing Gel + CICA-B5 Toner)",
        slug: "paket-basic-glow-honey-cleanser-toner",
        description: "Set dasar perawatan kulit dengan pembersih madu dan toner CICA-B5.",
        ingredients: ["Honey Extract", "Centella Asiatica", "Hyaluronic Acid"],
        howToUse: ["Gunakan pembersih untuk membersihkan wajah", "Lanjutkan dengan toner untuk menenangkan kulit"],
        category: "Skincare",
        sku: "BASIC-GLOW-001",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser+%2B+Toner",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Honey+Cleansing+Gel+%2B+CICA-B5+Toner",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser+%2B+Toner",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Honey+%2B+Toner",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Basic+Glow+Set",
        ],
        isFlashSale: true,
        type: "bundle",
        isEvent: true,
        weightGr: 100,
        soldCount: 450,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 100 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 80 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Bright Glow (Glow Serum + Vit C Daycream SPF 50)",
        slug: "paket-bright-glow-serum-daycream",
        description: "Set pencerah kulit dengan serum glow dan daycream SPF 50.",
        ingredients: ["Niacinamide", "Vitamin C", "SPF 50"],
        howToUse: ["Oleskan serum ke wajah", "Gunakan daycream setiap pagi untuk perlindungan UV"],
        category: "Skincare",
        sku: "BRIGHT-GLOW-002",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Serum+%2B+Daycream+SPF+50",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Glow+Serum+%2B+Daycream",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Serum+%2B+Daycream+SPF+50",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Bright+Glow+Set",
            "https://placehold.co/600x600/38bdf8/ffffff?text=VitC+%2B+Serum",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 35,
        soldCount: 200,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 90 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 70 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Hydration Shield (Hydro Cream + CICA-B5 Toner)",
        slug: "paket-hydration-shield-cream-toner",
        description: "Set hidrasi dengan krim pelembap dan toner CICA-B5 untuk kulit lembap dan tenang.",
        ingredients: ["Hyaluronic Acid", "Centella Asiatica", "Shea Butter"],
        howToUse: ["Oleskan krim ke wajah", "Gunakan toner untuk menenangkan kulit", "Gunakan pagi dan malam"],
        category: "Skincare",
        sku: "HYDRATION-SHIELD-003",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Hydro+Cream+%2B+CICA-B5+Toner",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Hydration+Shield",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Hydro+Cream+%2B+Toner",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Hydration+Set",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Moist+%2B+Calm",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 80,
        soldCount: 300,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 90 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 70 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Pore Care (Pore-EX Facial Pad + Honey Cleanser)",
        slug: "paket-pore-care-pad-cleanser",
        description: "Set perawatan pori dengan pad eksfoliasi dan pembersih madu untuk kulit bersih dan halus.",
        ingredients: ["Prebiotic Complex", "Honey Extract", "Salicylic Acid"],
        howToUse: ["Gunakan pad pada wajah", "Pijat lembut dengan pembersih", "Bilas dengan air"],
        category: "Skincare",
        sku: "PORE-CARE-004",
        front_image: "https://placehold.co/600x600/3b82f6/ffffff?text=Pore-EX+Pad+%2B+Cleanser",
        back_image: "https://placehold.co/600x600/1e3a8a/ffffff?text=Pore+Care+Set",
        galleryImages: [
            "https://placehold.co/600x600/3b82f6/ffffff?text=Pore-EX+Pad+%2B+Cleanser",
            "https://placehold.co/600x600/1e3a8a/ffffff?text=Pore+Care+Set",
            "https://placehold.co/600x600/3b82f6/ffffff?text=Exfoliate+%2B+Cleanse",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 200,
        soldCount: 150,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 80 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 60 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 40 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 20 },
        ],
    },
    {
        name: "Paket Intimate Care (Feminine Mousse + Hydro Cream)",
        slug: "paket-intimate-care-mousse-cream",
        description: "Set perawatan intim dengan pembersih mousse dan krim pelembap untuk kenyamanan sehari-hari.",
        ingredients: ["Chamomile Extract", "Hyaluronic Acid", "Aloe Vera"],
        howToUse: ["Kocok mousse secukupnya", "Oleskan lembut ke area intim", "Gunakan krim untuk melembapkan"],
        category: "Intimate Care",
        sku: "INTIMATE-CARE-005",
        front_image: "https://placehold.co/600x600/f59e0b/ffffff?text=Intimate+Mousse+%2B+Hydro+Cream",
        back_image: "https://placehold.co/600x600/fbbf24/111111?text=Intimate+Care+Set",
        galleryImages: [
            "https://placehold.co/600x600/f59e0b/ffffff?text=Intimate+Mousse+%2B+Hydro+Cream",
            "https://placehold.co/600x600/fbbf24/111111?text=Intimate+Care+Set",
            "https://placehold.co/600x600/f59e0b/ffffff?text=Cleanse+%2B+Hydrate",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 80,
        soldCount: 100,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 70 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 50 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 30 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 20 },
        ],
    },
    // --- Bundle Tambahan ---
    {
        name: "Paket Acne Defense (Pore-EX Pad + CICA-B5 Toner)",
        slug: "paket-acne-defense-pad-toner",
        description: "Duo andalan untuk membantu membersihkan pori dan menenangkan kemerahan.",
        ingredients: ["Prebiotic Complex", "Salicylic Acid", "Centella Asiatica", "Hyaluronic Acid"],
        howToUse: ["Gunakan Pore-EX Pad pada wajah bersih, fokus area berminyak", "Lanjutkan dengan CICA-B5 Toner untuk menenangkan kulit"],
        category: "Skincare",
        sku: "ACNE-DEFENSE-006",
        front_image: "https://placehold.co/600x600/1e3a8a/ffffff?text=Pad+%2B+Toner",
        back_image: "https://placehold.co/600x600/3b82f6/ffffff?text=Acne+Defense",
        galleryImages: [
            "https://placehold.co/600x600/1e3a8a/ffffff?text=Pore-EX+Pad",
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Toner",
            "https://placehold.co/600x600/3b82f6/ffffff?text=Pad+%2B+Toner",
        ],
        isFlashSale: true,
        type: "bundle",
        isEvent: true,
        weightGr: 200,
        soldCount: 180,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 100 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 80 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Hydrate & Glow (CICA-B5 Toner + Glow Serum)",
        slug: "paket-hydrate-glow-toner-serum",
        description: "Kombinasi untuk hidrasi maksimal dan tampilan kulit lebih cerah berkilau.",
        ingredients: ["Centella Asiatica", "Hyaluronic Acid", "Niacinamide", "Vitamin C"],
        howToUse: ["Aplikasikan CICA-B5 Toner setelah cuci muka", "Lanjutkan 2–3 tetes Glow Serum hingga meresap"],
        category: "Skincare",
        sku: "HYDRATE-GLOW-007",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Toner+%2B+Serum",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Hydrate+%26+Glow",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Toner",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Glow+Serum",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Duo+Hydrate+Glow",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 65,
        soldCount: 320,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 90 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 70 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Morning Shield (Honey Cleanser + Daycream SPF 50)",
        slug: "paket-morning-shield-cleanser-daycream",
        description: "Rutinitas pagi: kulit bersih dan terlindungi dari UV sepanjang hari.",
        ingredients: ["Honey Extract", "Aloe Vera", "Vitamin C", "Niacinamide", "SPF 50"],
        howToUse: ["Bersihkan wajah dengan Honey Cleansing Gel", "Oleskan Vit C Tone-Up Daycream SPF 50 secara merata"],
        category: "Skincare",
        sku: "MORNING-SHIELD-008",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser+%2B+SPF50",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Morning+Shield",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Honey+Cleanser",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Daycream+SPF50",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Paket+Morning",
        ],
        isFlashSale: true,
        type: "bundle",
        isEvent: true,
        weightGr: 70,
        soldCount: 410,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 110 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 85 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 55 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 35 },
        ],
    },
    {
        name: "Paket Night Repair (Glow Serum + Hydro Cream)",
        slug: "paket-night-repair-serum-cream",
        description: "Perawatan malam untuk membantu perbaikan skin barrier dan kekenyalan kulit.",
        ingredients: ["Niacinamide", "Vitamin C", "Hyaluronic Acid", "Shea Butter", "Chamomile"],
        howToUse: ["Gunakan Glow Serum setelah toner", "Kunci dengan Hydro Restorative Cream"],
        category: "Skincare",
        sku: "NIGHT-REPAIR-009",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Serum+%2B+Cream",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Night+Repair",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Glow+Serum",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Hydro+Cream",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Serum+%2B+Cream",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 45,
        soldCount: 220,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 95 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 75 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket 3-Step Basic (Cleanser + Toner + Hydro Cream)",
        slug: "paket-3-step-basic-cleanser-toner-cream",
        description: "Langkah dasar harian: bersihkan, tenangkan, lalu lembapkan.",
        ingredients: ["Honey Extract", "Centella Asiatica", "Hyaluronic Acid", "Shea Butter"],
        howToUse: ["Bersihkan wajah dengan Honey Cleansing Gel", "Aplikasikan CICA-B5 Toner", "Tutup dengan Hydro Restorative Cream"],
        category: "Skincare",
        sku: "THREE-STEP-010",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser+%2B+Toner+%2B+Cream",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=3-Step+Basic",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Toner",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Cream",
        ],
        isFlashSale: true,
        type: "bundle",
        isEvent: true,
        weightGr: 130,
        soldCount: 150,
        variants: [
            { name: "Small Set", price: 420000, oldPrice: 470000, stock: 80 },
            { name: "Medium Set", price: 760000, oldPrice: 850000, stock: 60 },
            { name: "Large Set", price: 1080000, oldPrice: 1200000, stock: 40 },
            { name: "Family Set", price: 1390000, oldPrice: 1550000, stock: 25 },
        ],
    },
    {
        name: "Paket Brightening Power (Serum + Toner + Daycream)",
        slug: "paket-brightening-power-serum-toner-daycream",
        description: "Trio pencerah untuk tampilan kulit merata, lembap, dan terlindungi.",
        ingredients: ["Niacinamide", "Vitamin C", "Centella Asiatica", "Hyaluronic Acid", "SPF 50"],
        howToUse: ["Gunakan CICA-B5 Toner", "Aplikasikan Glow Serum", "Pagi hari tutup dengan Daycream SPF 50"],
        category: "Skincare",
        sku: "BRIGHT-POWER-011",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Serum+%2B+Toner+%2B+SPF",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Brightening+Power",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Toner",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Serum",
            "https://placehold.co/600x600/38bdf8/ffffff?text=SPF+50",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 85,
        soldCount: 110,
        variants: [
            { name: "Small Set", price: 420000, oldPrice: 470000, stock: 75 },
            { name: "Medium Set", price: 760000, oldPrice: 850000, stock: 55 },
            { name: "Large Set", price: 1080000, oldPrice: 1200000, stock: 35 },
            { name: "Family Set", price: 1390000, oldPrice: 1550000, stock: 20 },
        ],
    },
    {
        name: "Paket Pore Solution (Pad + Cleanser + Toner)",
        slug: "paket-pore-solution-pad-cleanser-toner",
        description: "Solusi pori 3 langkah: eksfoliasi, bersihkan, lalu menenangkan kulit.",
        ingredients: ["Prebiotic Complex", "Salicylic Acid", "Honey Extract", "Centella Asiatica"],
        howToUse: ["Gunakan Pore-EX Pad", "Cuci wajah dengan Honey Cleansing Gel", "Aplikasikan CICA-B5 Toner"],
        category: "Skincare",
        sku: "PORE-SOLUTION-012",
        front_image: "https://placehold.co/600x600/3b82f6/ffffff?text=Pad+%2B+Cleanser+%2B+Toner",
        back_image: "https://placehold.co/600x600/1e3a8a/ffffff?text=Pore+Solution",
        galleryImages: [
            "https://placehold.co/600x600/3b82f6/ffffff?text=Pore-EX+Pad",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Honey+Cleanser",
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Toner",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 250,
        soldCount: 88,
        variants: [
            { name: "Small Set", price: 420000, oldPrice: 470000, stock: 70 },
            { name: "Medium Set", price: 760000, oldPrice: 850000, stock: 55 },
            { name: "Large Set", price: 1080000, oldPrice: 1200000, stock: 35 },
            { name: "Family Set", price: 1390000, oldPrice: 1550000, stock: 20 },
        ],
    },
    {
        name: "Paket Ultimate Routine (Cleanser + Toner + Serum + Cream)",
        slug: "paket-ultimate-routine-cleanser-toner-serum-cream",
        description: "Paket 4 langkah lengkap untuk hidrasi, barrier care, dan glow sehat.",
        ingredients: ["Honey Extract", "Centella Asiatica", "Niacinamide", "Vitamin C", "Hyaluronic Acid", "Shea Butter"],
        howToUse: ["Bersihkan dengan Honey Cleansing Gel", "Gunakan CICA-B5 Toner", "Aplikasikan Glow Serum", "Kunci dengan Hydro Restorative Cream"],
        category: "Skincare",
        sku: "ULTIMATE-ROUTINE-013",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=4-Step+Routine",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Ultimate+Routine",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=Cleanser%2BToner",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Serum",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Cream",
        ],
        isFlashSale: true,
        type: "bundle",
        isEvent: true,
        weightGr: 145,
        soldCount: 45,
        variants: [
            { name: "Small Set", price: 550000, oldPrice: 620000, stock: 80 },
            { name: "Medium Set", price: 990000, oldPrice: 1100000, stock: 60 },
            { name: "Large Set", price: 1420000, oldPrice: 1600000, stock: 40 },
            { name: "Family Set", price: 1850000, oldPrice: 2100000, stock: 25 },
        ],
    },
    {
        name: "Paket Sun-Ready (Toner + Daycream SPF 50)",
        slug: "paket-sun-ready-toner-daycream",
        description: "Kulit siap aktivitas: hidrasi lembut dari toner dan perlindungan SPF 50.",
        ingredients: ["Centella Asiatica", "Hyaluronic Acid", "Vitamin C", "Niacinamide", "SPF 50"],
        howToUse: ["Aplikasikan CICA-B5 Toner", "Gunakan Vit C Tone-Up Daycream SPF 50 di pagi/siang"],
        category: "Skincare",
        sku: "SUN-READY-014",
        front_image: "https://placehold.co/600x600/38bdf8/ffffff?text=Toner+%2B+SPF50",
        back_image: "https://placehold.co/600x600/0ea5e9/ffffff?text=Sun-Ready",
        galleryImages: [
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Toner",
            "https://placehold.co/600x600/38bdf8/ffffff?text=Daycream+SPF50",
            "https://placehold.co/600x600/0ea5e9/ffffff?text=Sun+Routine",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 70,
        soldCount: 190,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 90 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 70 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 50 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 30 },
        ],
    },
    {
        name: "Paket Intimate Fresh (Feminine Mousse + CICA-B5 Toner)",
        slug: "paket-intimate-fresh-mousse-toner",
        description: "Kenyamanan area intim dan keseimbangan kulit wajah dalam satu paket.",
        ingredients: ["Chamomile Extract", "Aloe Vera", "Centella Asiatica", "Hyaluronic Acid"],
        howToUse: ["Gunakan Intimate Feminine Mousse Cleanser sesuai kebutuhan", "Aplikasikan CICA-B5 Toner pada wajah setelah cuci muka"],
        category: "Intimate Care",
        sku: "INTIMATE-FRESH-015",
        front_image: "https://placehold.co/600x600/f59e0b/ffffff?text=Mousse+%2B+Toner",
        back_image: "https://placehold.co/600x600/fbbf24/111111?text=Intimate+Fresh",
        galleryImages: [
            "https://placehold.co/600x600/f59e0b/ffffff?text=Feminine+Mousse",
            "https://placehold.co/600x600/38bdf8/ffffff?text=CICA-B5+Toner",
            "https://placehold.co/600x600/f59e0b/ffffff?text=Mousse+%2B+Toner",
        ],
        isFlashSale: false,
        type: "bundle",
        isEvent: true,
        weightGr: 100,
        soldCount: 95,
        variants: [
            { name: "Small Set", price: 288000, oldPrice: 320000, stock: 70 },
            { name: "Medium Set", price: 520000, oldPrice: 580000, stock: 55 },
            { name: "Large Set", price: 750000, oldPrice: 830000, stock: 35 },
            { name: "Family Set", price: 980000, oldPrice: 1080000, stock: 20 },
        ],
    }
];

const seedProducts = async () => {
    try {
        await db.authenticate();
        console.log("Database connected...");

        // Add this line to force sync schema if needed (careful in prod)
        await Products.sync({ alter: true });

        // Clear existing
        try {
            await ProductStocks.destroy({ truncate: true, cascade: true });
            await ProductVariantPrices.destroy({ truncate: true, cascade: true });
            await ProductVariants.destroy({ truncate: true, cascade: true });
            await ProductImages.destroy({ truncate: true, cascade: true });
            await Products.destroy({ truncate: true, cascade: true });
            console.log("Cleanup done.");
        } catch (e) {
            console.log("Cleanup warning:", e);
        }

        for (const p of productsData) {

            // Create Product
            const product = await Products.create({
                name: p.name,
                slug: p.slug,
                category: p.category,
                description: p.description,
                longdescription: p.description,
                type: p.type as any,
                is_flash_sale: p.isFlashSale,
                is_event: p.isEvent,
                weight_gr: p.weightGr,
                sold_count: p.soldCount,
                ingredients: JSON.stringify(p.ingredients),
                howtouse: JSON.stringify(p.howToUse),
                front_image: p.front_image,
                back_image: p.back_image,
                sku: p.sku
            } as any);

            // Images
            if (p.galleryImages) {
                for (const imgUrl of p.galleryImages) {
                    await ProductImages.create({
                        product_id: product.id,
                        image_url: imgUrl
                    });
                }
            }

            // Create Variants & Prices
            for (const v of p.variants) {
                const variant = await ProductVariants.create({
                    product_id: product.id,
                    variant_name: v.name,
                    weight: "0" // Default weight for variant if not specified in data
                });

                await ProductVariantPrices.create({
                    variant_id: variant.id,
                    channel: "default",
                    price: v.price,
                    price_strikethrough: v.oldPrice || 0
                });

                // Add Stock
                await ProductStocks.create({
                    product_id: product.id,
                    variant_id: variant.id,
                    channel: "default",
                    qty: v.stock,
                    tanggal_masuk: new Date(),
                    tanggal_expired: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    status: "noexpired"
                });
            }

            console.log(`✅ Product ${p.name} created.`);
        }

        console.log("✅ Seed products completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed products:", error);
        process.exit(1);
    }
};

seedProducts();
