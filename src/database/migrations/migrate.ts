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


export const syncDB = async () => {
    try {
        // Order matters for constraints
        // Order matters for constraints
        await db.sync({ alter: true }); // Use alter instead of force to preserve data
        console.log("✅ Database synced successfully");
    } catch (err) {
        console.error("❌ Database sync failed:", err);
    }
};
