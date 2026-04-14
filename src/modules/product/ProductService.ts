import Products from "./models/ProductModel";
import ProductImages from "./models/ProductImageModel";
import ProductVariants from "./models/ProductVariantModel";
import ProductVariantPrices from "./models/ProductVariantPriceModel";
import ProductStocks from "./models/ProductStockModel";
import slugify from "slugify";
import { Op, fn, col, where } from "sequelize";

// Helper
// Helper
const normChannel = (v: any) => (v ?? "default").toString().trim().toLowerCase();

const formatProductToFrontend = (product: any, channelQuery?: string, activePromoItems?: Map<number, any>) => {
    const p = product.toJSON ? product.toJSON() : product;
    const channelQ = channelQuery ? normChannel(channelQuery) : null;

    // Parse JSON fields safely
    let ingredients: string[] = [];
    try { ingredients = JSON.parse(p.ingredients); } catch (e) { ingredients = p.ingredients ? [p.ingredients] : []; }

    let howToUse: string[] = [];
    try { howToUse = JSON.parse(p.howtouse); } catch (e) { howToUse = p.howtouse ? [p.howtouse] : []; }

    // Images
    const img = p.front_image || "";
    const imgHover = p.back_image || "";
    const galleryImages = (p.images || []).map((i: any) => i.image_url);

    // Filter/Process Variants
    let hasProductLevelFlashSale = false;
    const variants = (p.variants || []).map((v: any) => {
        let prices = v.prices || [];
        let stocks = v.stocks || [];

        if (channelQ) {
            prices = prices.filter((pr: any) => normChannel(pr.channel) === channelQ);
            stocks = stocks.filter((st: any) => normChannel(st.channel) === channelQ);
        }

        // Price Logic: prioritizes specific channel or default, falls back to first available
        const activePrice = prices.find((pr: any) => normChannel(pr.channel) === (channelQ || "default"))
            || prices.find((pr: any) => normChannel(pr.channel) === "default")
            || prices[0];

        let price = activePrice ? Number(activePrice.price) : 0;
        let oldPrice = activePrice && activePrice.price_strikethrough ? Number(activePrice.price_strikethrough) : undefined;

        // FLASH SALE OVERRIDE (GLOBAL SYNC)
        if (activePromoItems && activePromoItems.has(Number(v.id))) {
            const promo = activePromoItems.get(Number(v.id));
            oldPrice = promo.original_price || price; // Use promo's original price if available
            price = Number(promo.flash_sale_price);
            hasProductLevelFlashSale = true;
        }

        // Stock Logic
        const stock = stocks.reduce((sum: number, st: any) => sum + (st.status !== 'expired' ? Number(st.qty) : 0), 0);

        return {
            id: v.id,
            name: v.variant_name,
            price,
            oldPrice,
            stock,
            weight: v.weight ? Number(v.weight) : 0,
            soldCount: Number(v.sold_count || 0),
            // Keep original for internal use if needed, but frontend only needs above
            raw_prices: prices,
            raw_stocks: stocks
        };
    });

    // Best-selling variant count logic
    const bestVariantSales = variants.reduce((max: number, v: any) => Math.max(max, v.soldCount), 0);
    // Use the maximum variant sales as the representative soldCount if total sold_count is 0 (fallback)
    // or if the user specifically wants the best variant highlighted.
    // For now, I'll use the MAX variant sales to satisfy "ambil variant yang banyak terjual aja".
    const displaySoldCount = Math.max(bestVariantSales, Number(p.sold_count || 0));

    // Calculate Product Level Price Range & Identify "Hero" Variant (lowest price)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minOldPrice = Infinity;
    let maxOldPrice = -Infinity;
    let hasVariants = variants.length > 0;
    let heroVariant: any = null;

    variants.forEach((v: any) => {
        // Find absolute min/max for range display
        if (v.price < minPrice) {
            minPrice = v.price;
            heroVariant = v; // The variant that determines the displayed "min" price
        }
        if (v.price > maxPrice) maxPrice = v.price;

        // Keep track of old price ranges for complex displays if needed
        if (v.oldPrice) {
            if (v.oldPrice > maxOldPrice) maxOldPrice = v.oldPrice;
        }
    });

    // Strategy: The displayed "old price" (strikethrough) must match the "min price" variant
    // to keep the discount percentage consistent and honest.
    if (heroVariant && heroVariant.oldPrice) {
        minOldPrice = heroVariant.oldPrice;
    }

    if (!hasVariants) {
        minPrice = 0;
        maxPrice = 0;
        minOldPrice = 0;
        maxOldPrice = 0;
    }

    const priceString = minPrice === maxPrice
        ? `Rp${Math.round(minPrice).toLocaleString('id-ID')}`
        : `Rp${Math.round(minPrice).toLocaleString('id-ID')} - Rp${Math.round(maxPrice).toLocaleString('id-ID')}`;

    const oldPriceString = minOldPrice === Infinity ? undefined :
        (minOldPrice === maxOldPrice
            ? `Rp${Math.round(minOldPrice).toLocaleString('id-ID')}`
            : `Rp${Math.round(minOldPrice).toLocaleString('id-ID')} - Rp${Math.round(maxOldPrice).toLocaleString('id-ID')}`);

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || "",
        ingredients,
        howToUse,
        category: p.category || "",
        sku: p.sku || "",
        price: priceString,
        oldPrice: oldPriceString,
        img,
        imgHover,
        galleryImages,
        isFlashSale: hasProductLevelFlashSale || !!p.is_flash_sale,
        isEvent: !!p.is_event,
        type: p.type || "single",
        variants,
        weightGr: Number(p.weight_gr || 0),
        soldCount: displaySoldCount
    };
};

export const incrementSoldCount = async (items: { variant_id?: number; product_id: string; quantity: number }[], transaction: any) => {
    for (const item of items) {
        // Increment Product Level
        await Products.increment('sold_count', {
            by: item.quantity,
            where: { id: item.product_id },
            transaction
        });

        // Increment Variant Level
        if (item.variant_id) {
            await ProductVariants.increment('sold_count', {
                by: item.quantity,
                where: { id: item.variant_id },
                transaction
            });
        }
    }
};

export const getAllProducts = async (searchQuery?: string, activePromoItems?: Map<number, any>) => {
    const whereCondition: any = {};

    if (searchQuery) {
        const lowerQuery = `%${searchQuery.toLowerCase()}%`;
        whereCondition[Op.or] = [
            { name: { [Op.iLike]: lowerQuery } },
            { description: { [Op.iLike]: lowerQuery } },
            { category: { [Op.iLike]: lowerQuery } },
        ];
    }

    const products = await Products.findAll({
        where: whereCondition,
        include: [
            {
                model: ProductImages,
                as: "images",
                attributes: ["id", "image_url", "alt_text"],
            },
            {
                model: ProductVariants,
                as: "variants",
                attributes: ["id", "variant_name", "weight"],
                include: [
                    {
                        model: ProductVariantPrices,
                        as: "prices",
                        attributes: ["id", "channel", "price", "price_strikethrough"],
                        where: { channel: "default" },
                        required: false
                    },
                    {
                        model: ProductStocks,
                        as: "stocks",
                        attributes: ["id", "qty", "channel", "tanggal_masuk", "tanggal_expired", "status"],
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]], // Changed from ID ASC because UUID is not sortable by insertion order easily
    });

    return products.map((product) => formatProductToFrontend(product, undefined, activePromoItems));
};

export const getProductDetail = async (productId: string, channelQuery?: string, activePromoItems?: Map<number, any>) => {
    const include = [
        {
            model: ProductImages,
            as: "images",
            attributes: ["id", "image_url", "alt_text"],
        },
        {
            model: ProductVariants,
            as: "variants",
            attributes: ["id", "variant_name", "weight"],
            include: [
                {
                    model: ProductVariantPrices,
                    as: "prices",
                    attributes: ["id", "channel", "price", "price_strikethrough"],
                    where: { channel: "default" },
                    required: false
                },
                {
                    model: ProductStocks,
                    as: "stocks",
                    attributes: ["id", "qty", "channel", "tanggal_masuk", "tanggal_expired", "status"],
                },
            ],
        },
    ];

    // UUID validation regex (simple check)
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId);

    const product = isUUID
        ? await Products.findByPk(productId, { include })
        : await Products.findOne({ where: { slug: productId }, include });

    if (!product) throw new Error("Produk tidak ditemukan");

    return formatProductToFrontend(product, channelQuery, activePromoItems);
};

export const createProduct = async (data: any) => {
    const t = await Products.sequelize!.transaction();
    try {
        const {
            name, slug, category, description, front_image, back_image,
            longdescription, effect, ingredients, howtouse, sku,
            type, is_flash_sale, is_event, weight_gr,
            images, variants
        } = data;

        const generatedSlug = slugify(slug || name, { lower: true, strict: true });
        const existingProduct = await Products.findOne({ where: { slug: generatedSlug }, transaction: t });

        if (existingProduct) {
            throw new Error(`Produk dengan nama/slug ini sudah ada (ID: ${existingProduct.id})`);
        }

        const product = await Products.create({
            name, slug: generatedSlug, category, description,
            front_image, back_image, longdescription, effect,
            ingredients: JSON.stringify(ingredients), howtouse: JSON.stringify(howtouse), sku,
            type, is_flash_sale, is_event, weight_gr, sold_count: data.sold_count || 0
        } as any, { transaction: t });

        if (images && images.length > 0) {
            const imageRecords = images.map((img: any) => ({
                product_id: product.id,
                image_url: img.url,
                alt_text: img.alt || null
            }));
            await ProductImages.bulkCreate(imageRecords, { transaction: t });
        }

        if (variants && variants.length > 0) {
            for (const variant of variants) {
                const variantRecord = await ProductVariants.create({
                    product_id: product.id,
                    variant_name: variant.variant_name,
                    weight: variant.weight
                } as any, { transaction: t });

                if (variant.prices && variant.prices.length > 0) {
                    const priceRecords = variant.prices.map((price: any) => ({
                        variant_id: variantRecord.id,
                        channel: price.channel || "default",
                        price: price.price,
                        price_strikethrough: price.price_strikethrough || null
                    }));
                    await ProductVariantPrices.bulkCreate(priceRecords, { transaction: t });
                }

                if (variant.stocks && variant.stocks.length > 0) {
                    const stockRecords = variant.stocks.map((stock: any) => ({
                        product_id: product.id,
                        variant_id: variantRecord.id,
                        qty: stock.qty,
                        channel: stock.channel || "default",
                        tanggal_masuk: stock.tanggal_masuk,
                        tanggal_expired: stock.tanggal_expired,
                        status: stock.status || "noexpired",
                    }));
                    await ProductStocks.bulkCreate(stockRecords, { transaction: t });
                }
            }
        }

        await t.commit();
        return product;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const updateProduct = async (id: string, data: any) => {
    const t = await Products.sequelize!.transaction();
    try {
        const product = await Products.findByPk(id);
        if (!product) throw new Error("Produk tidak ditemukan");

        await product.update(data, { transaction: t });

        if (data.images && Array.isArray(data.images)) {
            await ProductImages.destroy({ where: { product_id: id }, transaction: t });
            const imageRecords = data.images.map((img: any) => ({
                product_id: id,
                image_url: img.url,
                alt_text: img.alt || null,
            }));
            if (imageRecords.length > 0) {
                await ProductImages.bulkCreate(imageRecords, { transaction: t });
            }
        }

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const deleteProduct = async (productId: string) => {
    const t = await Products.sequelize!.transaction();
    try {
        const product = await Products.findByPk(productId, { transaction: t });
        if (!product) throw new Error("Produk tidak ditemukan");

        const variants = await ProductVariants.findAll({ where: { product_id: product.id }, transaction: t });
        const variantIds = variants.map(v => v.id);

        await ProductImages.destroy({ where: { product_id: product.id }, transaction: t });

        if (variantIds.length > 0) {
            await ProductVariantPrices.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction: t });
            await ProductStocks.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction: t });
            await ProductVariants.destroy({ where: { id: { [Op.in]: variantIds } }, transaction: t });
        } else {
            // Fallback if stocks somehow exist without variants
            await ProductStocks.destroy({ where: { product_id: product.id }, transaction: t });
        }

        await Products.destroy({ where: { id: product.id }, transaction: t });

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// --- STOCK & VARIANT ---

export const getProductStock = async (productId: string) => {
    const product = await Products.findByPk(productId, {
        include: [
            {
                model: ProductVariants,
                as: "variants",
                attributes: ["id", "variant_name"],
                include: [
                    {
                        model: ProductStocks,
                        as: "stocks",
                        attributes: ["id", "qty", "channel", "tanggal_masuk", "tanggal_expired"],
                    },
                ],
            },
        ],
    });

    if (!product) throw new Error("Produk tidak ditemukan");

    const pJson = product.toJSON() as any;
    const variants = pJson.variants.map((variant: any) => {
        const stockPerChannel: Record<string, number> = {};
        variant.stocks.forEach((stock: any) => {
            const ch = stock.channel || "default";
            if (!stockPerChannel[ch]) stockPerChannel[ch] = 0;
            stockPerChannel[ch] += stock.qty;
        });
        const totalStock = Object.values(stockPerChannel).reduce((sum, qty) => sum + qty, 0);
        return { ...variant, total_stock: totalStock, stock_per_channel: stockPerChannel };
    });

    return { product_id: product.id, product_name: product.name, variants };
};

export const addStock = async (stocks: any[]) => {
    const t = await ProductStocks.sequelize!.transaction();
    try {
        const variantIds = stocks.map(s => s.variant_id);
        const existingVariants = await ProductVariants.findAll({ where: { id: variantIds }, attributes: ["id"] });
        const existingIds = existingVariants.map(v => v.id);

        const validStocks = stocks.filter(s => existingIds.includes(s.variant_id));
        if (validStocks.length === 0) throw new Error("Tidak ada variant valid");

        const stockRecords = validStocks.map(stock => ({
            variant_id: stock.variant_id,
            qty: stock.qty,
            channel: stock.channel || "default",
            tanggal_masuk: stock.tanggal_masuk || new Date(),
            tanggal_expired: stock.tanggal_expired || null,
            product_id: undefined // will be filled via association or ignored if not strict
        }));

        await ProductStocks.bulkCreate(stockRecords, { transaction: t });
        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const updateStock = async (id: string, data: any) => {
    const stock = await ProductStocks.findByPk(id);
    if (!stock) throw new Error("Stok tidak ditemukan");

    await stock.update(data);
    return stock;
};

export const deleteStock = async (variantId: string, stockId: string) => {
    const stock = await ProductStocks.findOne({ where: { id: stockId, variant_id: variantId } });
    if (!stock) throw new Error("Stok tidak ditemukan");
    await stock.destroy();
    return true;
};

export const transferStock = async (data: { variantId: string | number, fromChannel: string, toChannel: string, qty: number }) => {
    const t = await ProductStocks.sequelize!.transaction();
    try {
        const { variantId, fromChannel, toChannel, qty } = data;
        const fromCh = normChannel(fromChannel);
        const toCh = normChannel(toChannel);

        if (fromCh === toCh) throw new Error("Lokasi sumber dan tujuan tidak boleh sama");
        if (qty <= 0) throw new Error("Jumlah transfer harus lebih dari 0");

        // 1. Find source stocks
        const sourceStocks = await ProductStocks.findAll({
            where: { variant_id: variantId, channel: fromCh, status: { [Op.ne]: "expired" } },
            order: [["tanggal_expired", "ASC"], ["created_at", "ASC"]], // FEFO: First Expired First Out
            transaction: t
        });

        const totalAvailable = sourceStocks.reduce((sum, s) => sum + s.qty, 0);
        if (totalAvailable < qty) {
            throw new Error(`Stok di ${fromChannel} tidak mencukupi (Tersedia: ${totalAvailable})`);
        }

        // 2. Deduct from source (can span multiple batches)
        let remainingToDeduct = qty;
        let lastSourceStock: any = null;

        for (const stock of sourceStocks) {
            if (remainingToDeduct <= 0) break;
            const deduct = Math.min(stock.qty, remainingToDeduct);
            await stock.update({ qty: stock.qty - deduct }, { transaction: t });
            remainingToDeduct -= deduct;
            lastSourceStock = stock;
        }

        // 3. Add to target
        // We try to find if there's an existing stock record with same expiry/batch in target channel
        // For simplicity, we just create a NEW record in the target channel 
        // copied from the lastSourceStock info (expiry date, entry date)
        await ProductStocks.create({
            product_id: lastSourceStock.product_id,
            variant_id: variantId as any,
            qty: qty,
            channel: toCh,
            tanggal_masuk: new Date(),
            tanggal_expired: lastSourceStock.tanggal_expired,
            status: lastSourceStock.status || "noexpired"
        } as any, { transaction: t });

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const addProductVariant = async (data: any) => {
    const t = await Products.sequelize!.transaction();
    try {
        const { product_id, variant_name, weight, prices, stocks } = data;
        const product = await Products.findByPk(product_id, { transaction: t });
        if (!product) throw new Error("Produk tidak ditemukan");

        const nameNorm = variant_name.trim().toLowerCase();
        const existing = await ProductVariants.findOne({
            where: { product_id, [Op.and]: where(fn("LOWER", col("variant_name")), nameNorm) },
            transaction: t
        });

        if (existing) throw new Error(`Varian ${variant_name} sudah ada`);

        const variantRecord = await ProductVariants.create({
            product_id, variant_name: variant_name.trim(), weight: weight ?? null
        } as any, { transaction: t });

        if (prices && prices.length > 0) {
            const priceRecords = prices.map((price: any) => ({
                variant_id: variantRecord.id,
                channel: (price.channel ?? "default").toString().trim().toLowerCase(),
                price: price.price,
                price_strikethrough: price.price_strikethrough ?? null,
            }));
            await ProductVariantPrices.bulkCreate(priceRecords, { transaction: t });
        }

        if (stocks && stocks.length > 0) {
            const stockRecords = stocks.map((stock: any) => ({
                product_id, // Variant creation usually has product context
                variant_id: variantRecord.id,
                qty: stock.qty,
                channel: (stock.channel ?? "default").toString().trim().toLowerCase(),
                tanggal_masuk: stock.tanggal_masuk ?? null,
                tanggal_expired: stock.tanggal_expired ?? null,
                status: stock.status ?? "noexpired",
            }));
            await ProductStocks.bulkCreate(stockRecords, { transaction: t });
        }

        await t.commit();
        return variantRecord;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const updateProductVariant = async (variantId: string, data: any) => {
    const t = await Products.sequelize!.transaction();
    try {
        const { variant_name, weight, prices, stocks, remove_missing, dedupe_channel } = data;
        const variant = await ProductVariants.findByPk(variantId, { transaction: t });
        if (!variant) throw new Error("Varian tidak ditemukan");

        if (variant_name) {
            variant.variant_name = variant_name.trim();
            await variant.save({ transaction: t });
        }
        if (weight !== undefined) {
            variant.weight = weight;
            await variant.save({ transaction: t });
        }

        // Logic for prices update
        if (prices && Array.isArray(prices)) {
            for (const p of prices) {
                const channelNorm = (p.channel || "default").toString().trim().toLowerCase();
                const [priceRecord, created] = await ProductVariantPrices.findOrCreate({
                    where: { variant_id: variantId, channel: channelNorm },
                    defaults: {
                        variant_id: Number(variantId),
                        channel: channelNorm as any,
                        price: p.price,
                        price_strikethrough: p.price_strikethrough ?? null
                    },
                    transaction: t
                });

                if (!created) {
                    await priceRecord.update({
                        price: p.price,
                        price_strikethrough: p.price_strikethrough ?? null
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const deleteProductVariant = async (productId: string, variantId: string) => {
    const t = await Products.sequelize!.transaction();
    try {
        const variant = await ProductVariants.findOne({ where: { id: variantId, product_id: productId } });
        if (!variant) throw new Error("Varian tidak ditemukan");

        await ProductVariantPrices.destroy({ where: { variant_id: variantId }, transaction: t });
        await ProductStocks.destroy({ where: { variant_id: variantId }, transaction: t });
        await variant.destroy({ transaction: t });

        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const getVariantById = async (variantId: string) => {
    return await ProductVariants.findByPk(variantId);
};

export const calculateProductPrice = async (data: { productId: string, variantId: number, qty: number, channel?: string, activePromoItems?: Map<number, any> }) => {
    const { productId, variantId, qty, channel, activePromoItems } = data;
    // Trigger restart 1

    // 1. Validasi Input
    if (!productId || !variantId || qty <= 0) {
        throw new Error("Invalid input: productId, variantId, and qty > 0 are required");
    }

    // 2. Ambil Data Variant & Harga
    const variant = await ProductVariants.findOne({
        where: { id: Number(variantId) },
        include: [
            {
                model: ProductVariantPrices,
                as: "prices",
                attributes: ["channel", "price", "price_strikethrough"]
            },
            {
                model: ProductStocks,
                as: "stocks",
                attributes: ["channel", "qty", "status"]
            },
            {
                model: Products, // Ambil info produk juga untuk nama/berat
                as: "Product",
                attributes: ["name", "weight_gr", "front_image"]
            }
        ]
    });

    if (!variant) {
        throw new Error(`Varian produk tidak ditemukan (pid: ${productId}, vid: ${variantId})`);
    }

    const vJson = variant.toJSON() as any;
    const channelQ = normChannel(channel);

    // 3. Tentukan Harga (Logic sama dengan formatProductToFrontend)
    let prices = vJson.prices || [];
    const activePrice = prices.find((pr: any) => normChannel(pr.channel) === channelQ)
        || prices.find((pr: any) => normChannel(pr.channel) === "default")
        || prices[0];

    if (!activePrice) {
        throw new Error("Harga tidak tersedia untuk varian ini");
    }

    const unitPrice = activePromoItems && activePromoItems.has(Number(variantId))
        ? Number(activePromoItems.get(Number(variantId)).flash_sale_price)
        : Number(activePrice.price);

    const oldPrice = activePromoItems && activePromoItems.has(Number(variantId))
        ? Number(activePromoItems.get(Number(variantId)).original_price || activePrice.price)
        : (activePrice.price_strikethrough ? Number(activePrice.price_strikethrough) : null);

    // 4. Hitung Total Stock (Opsional: Cek availability)
    let stocks = vJson.stocks || [];
    // Jika channel spesifik, cek stok channel itu aja, kalau tidak, total semua?
    // Biasanya stok end-user ambil dari total yang available
    const totalStock = stocks.reduce((sum: number, st: any) => sum + (st.status !== 'expired' ? Number(st.qty) : 0), 0);

    if (totalStock < qty) {
        throw new Error(`Stok tidak mencukupi (Tersedia: ${totalStock})`);
    }

    // 5. Kalkulasi
    const subtotal = unitPrice * qty;
    const weightTotal = (vJson.weight ? Number(vJson.weight) : 0) * qty;

    return {
        product_id: productId,
        variant_id: variantId,
        product_name: vJson.Product?.name,
        variant_name: vJson.variant_name,
        image: vJson.Product?.front_image,
        qty,
        unit_price: unitPrice,
        original_price: oldPrice,
        subtotal,
        total_weight: weightTotal,
        stock_available: totalStock
    };
};

export const deductStockForOrder = async (items: { variant_id?: number; product_id: string; quantity: number }[], transaction: any) => {
    for (const item of items) {
        if (!item.variant_id) continue;
        const stocks = await ProductStocks.findAll({
            where: {
                variant_id: item.variant_id,
                channel: { [Op.in]: ["website", "default"] },
                status: "noexpired"
            },
            order: [["tanggal_expired", "ASC"], ["created_at", "ASC"]],
            transaction
        });

        let remainingToDeduct = item.quantity;
        for (const stock of stocks) {
            if (remainingToDeduct === 0) break;
            if (stock.qty > 0) {
                const deduct = Math.min(stock.qty, remainingToDeduct);
                await stock.update({ qty: stock.qty - deduct }, { transaction });
                remainingToDeduct -= deduct;
            }
        }
        
        if (remainingToDeduct > 0) {
            console.warn(`[WARNING] DeductStock: Stok tidak mencukupi untuk variant_id: ${item.variant_id}, minus: ${remainingToDeduct}`);
        }
    }
};

export const restoreStockForOrder = async (items: { variant_id?: number; product_id: string; quantity: number }[], transaction: any) => {
    for (const item of items) {
        if (!item.variant_id) continue;
        const stock = await ProductStocks.findOne({
            where: {
                variant_id: item.variant_id,
                channel: { [Op.in]: ["website", "default"] },
                status: "noexpired"
            },
            order: [["created_at", "DESC"]], // Return to newest active stock pile
            transaction
        });

        if (stock) {
            await stock.update({ qty: stock.qty + item.quantity }, { transaction });
        } else {
            await ProductStocks.create({
                variant_id: item.variant_id as any,
                product_id: item.product_id as any,
                qty: item.quantity,
                channel: "website",
                tanggal_masuk: new Date(),
                tanggal_expired: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year fallback
                status: "noexpired"
            } as any, { transaction });
        }
    }
};
