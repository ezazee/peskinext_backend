import db from "../config/database";
import Products from "../modules/product/models/ProductModel";
import ProductVariants from "../modules/product/models/ProductVariantModel";

async function seedSalesData() {
    try {
        console.log("Seeding real-looking sales data...");
        
        const products = await Products.findAll();
        
        for (const product of products) {
            // Random total sales between 50 and 1500
            const productSales = Math.floor(Math.random() * 1450) + 50;
            
            await product.update({ sold_count: productSales });
            
            const variants = await ProductVariants.findAll({ where: { product_id: product.id } });
            
            if (variants.length > 0) {
                let remainingSales = productSales;
                
                for (let i = 0; i < variants.length; i++) {
                    const variant = variants[i];
                    let variantSales = 0;
                    
                    if (i === variants.length - 1) {
                        variantSales = remainingSales;
                    } else {
                        // Pick a portion of remaining sales
                        variantSales = Math.floor(Math.random() * (remainingSales / (variants.length - i)));
                        remainingSales -= variantSales;
                    }
                    
                    await variant.update({ sold_count: variantSales });
                }
            }
            
            console.log(`✅ Updated ${product.name} with ${productSales} total sales.`);
        }

        console.log("✅ Sales data seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedSalesData();
