import db from "../../config/database";

import Products from "../../modules/product/models/ProductModel";
import ProductStocks from "../../modules/product/models/ProductStockModel";
import ProductVariants from "../../modules/product/models/ProductVariantModel";
import ProductVariantPrices from "../../modules/product/models/ProductVariantPriceModel";
import ProductImages from "../../modules/product/models/ProductImageModel";
import Address from "../../modules/user/models/AddressModel";
import Coupons from "../../modules/coupon/models/CouponModel";
import Users from "../../modules/user/models/UserModel";
import Cart from "../../modules/cart/models/CartModel";
import UsersCart from "../../modules/cart/models/CartModel";
import Orders from "../../modules/order/models/OrderModel";
import OrderItems from "../../modules/order/models/OrderItemModel";
import OrderStatusHistory from "../../modules/order/models/OrderStatusHistoryModel";
import Transactions from "../../modules/transaction/models/TransactionModel";
import ShippingMethods from "../../modules/shipping/models/ShippingMethodModel";
import Reviews from "../../modules/review/models/ReviewModel";
import Invoices from "../../modules/invoice/models/InvoiceModel";

import Categories from "../../modules/article/models/CategoryModel";
import Tags from "../../modules/article/models/TagModel";
import Posts, { PostTags } from "../../modules/article/models/PostModel";
import PostImages from "../../modules/article/models/PostImageModel";
import Provinces from "../../modules/wilayah/models/ProvinceModel";
import Districts from "../../modules/wilayah/models/DistrictModel";
import Regencies from "../../modules/wilayah/models/RegencyModel";
import Villages from "../../modules/wilayah/models/VillageModel";
import Banners from "../../modules/banner/models/BannerModel";
import GeneralSettings from "../../modules/setting/models/SettingModel";
import FAQs from "../../modules/faq/models/FAQModel";
import FlashSale from "../../modules/flash-sale/models/FlashSaleModel";
import FlashSaleItems from "../../modules/flash-sale/models/FlashSaleItemModel";


export const syncDB = async () => {
    try {
        // Order matters for constraints
        // DISABLED: db.sync runs on every restart and is very slow
        // Only enable this when you need to update database schema
        // console.log("⚙️  Syncing database schema (please wait, do not stop)...");
        // await db.sync({ alter: true }); // Use alter instead of force to preserve data
        // console.log("✅ Database schema sync complete!");
        // await db.sync({ alter: true });


    // Just test the connection instead
        const allUsers = await Users.findAll({ 
            attributes: ['id', 'email', 'name', 'is_google'],
            order: [['email', 'ASC']]
        });
        
        // Removed hardcoded file write to avoid EROFS error on cloud deployment
        console.log(`✅ DB Connection OK. Found ${allUsers.length} users.`);
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
};
