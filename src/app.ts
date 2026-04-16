import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import * as Sentry from "@sentry/node";

// Import Routes
import AuthRoute from "./modules/auth/AuthRoute";
import UserRoute from "./modules/user/UserRoute";
import AddressRoute from "./modules/user/AddressRoute";
import ProductRoute from "./modules/product/ProductRoute";
import CartRoute from "./modules/cart/CartRoute";
import OrderRoute from "./modules/order/OrderRoute";
import ShippingRoute from "./modules/shipping/ShippingRoute";
import CategoryRoute from "./modules/article/routes/CategoryRoute";
import TagRoute from "./modules/article/routes/TagRoute";
import PostRoute from "./modules/article/routes/PostRoute";
import WilayahRoute from "./modules/wilayah/WilayahRoute";
import UploadRoute from "./modules/upload/UploadRoute";
import ReviewRoute from "./modules/review/ReviewRoute";
import CouponRoute from "./modules/coupon/CouponRoute";
import TransactionRoute from "./modules/transaction/TransactionRoute";
import InvoiceRoute from "./modules/invoice/InvoiceRoute";
import PaymentRoute from "./modules/payment/PaymentRoute";
import SettingRoute from "./modules/setting/SettingRoute";
import FAQRoute from "./modules/faq/FAQRoutes";
import FlashSaleRoute from "./modules/flash-sale/FlashSaleRoute";
import db from "./config/database";

// One-time Database Migration for Per-Variant Flash Sale & Performance Hardening
const runMigrations = async () => {
    try {
        console.log("🚀 Running Database Migrations...");
        
        // 1. Tambah kolom variant_id jika belum ada (Biteship/Flash Sale Prep)
        await db.query(`ALTER TABLE flash_sale_items ADD COLUMN IF NOT EXISTS variant_id INTEGER;`);
        
        // 2. Hubungkan data lama ke varian pertama (agar tidak NULL)
        await db.query(`
            UPDATE flash_sale_items fsi 
            SET variant_id = (SELECT id FROM product_variants pv WHERE pv.product_id = fsi.product_id LIMIT 1) 
            WHERE variant_id IS NULL;
        `);
        
        // 3. Set NOT NULL setelah data terisi
        await db.query(`ALTER TABLE flash_sale_items ALTER COLUMN variant_id SET NOT NULL;`);

        // 4. PRODUCTION HARDENING: ADD INDEXES for performance
        console.log("📈 Applying Performance Indexes...");
        await db.query(`
            -- Orders
            CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
            -- Products
            CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
            CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
            -- Order Items
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
            CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
            -- Reviews
            CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
            -- Variants
            CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
            -- Flash Sale
            CREATE INDEX IF NOT EXISTS idx_flash_sale_items_variant_id ON flash_sale_items(variant_id);
        `);
        
        console.log("✅ Migration Success: Database is optimized for production.");
    } catch (err: any) {
        console.error("❌ Migration Error:", err.message);
    }
};
runMigrations();


const app: Express = express();

// Trust Proxy for Rate Limiting/Deployment
app.set("trust proxy", 1);

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS
}));

app.use(hpp());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Limit each IP to 10000 requests per windowMs (Development Friendly)
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Performance
app.use(compression());

// @ts-ignore
app.use(express.json({ limit: "1mb" }));
// @ts-ignore
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // console.log("Incoming Request Origin:", origin);
        // Allow requests with no origin (like mobile apps or curl) or if match
        const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [];
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            console.warn(`CORS Warning: Origin ${origin} not in whitelist. Allowing for debug.`);
            callback(null, true); // Allow anyway for debug
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control", "Pragma"]
}));

import passport from "./config/passport";
app.use(passport.initialize());



// Attempt to load static swagger.json (generated at build time)
let finalSwaggerSpec = swaggerSpec;
try {
    const staticSpecPath = path.join(process.cwd(), "swagger.json");
    if (fs.existsSync(staticSpecPath)) {
        finalSwaggerSpec = JSON.parse(fs.readFileSync(staticSpecPath, "utf-8"));
    }
} catch (err) {
    console.warn("Could not load static swagger.json, falling back to runtime generation");
}

// Custom options to fix blank screen on Vercel/Serverless
const swaggerOptions = {
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js",
    ],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(finalSwaggerSpec, swaggerOptions));

// Routes
const apiV1 = express.Router();

apiV1.use("/", AuthRoute);
apiV1.use("/", UserRoute);
apiV1.use("/", AddressRoute);
apiV1.use("/", ProductRoute);
apiV1.use("/", CartRoute);
apiV1.use("/", OrderRoute);
apiV1.use("/", ShippingRoute);
apiV1.use("/", CategoryRoute);
apiV1.use("/", TagRoute);
apiV1.use("/", PostRoute);
apiV1.use("/", WilayahRoute);
apiV1.use("/", UploadRoute);
apiV1.use("/", ReviewRoute);
apiV1.use("/", CouponRoute);
import BannerRoute from "./modules/banner/BannerRoute";

// ... Routes (inside app usage)
apiV1.use("/", BannerRoute);
apiV1.use("/", TransactionRoute);
apiV1.use("/", InvoiceRoute);
apiV1.use("/", PaymentRoute);
apiV1.use("/", SettingRoute);
apiV1.use("/", FAQRoute);
import NotificationRoute from "./modules/notification/NotificationRoute";
apiV1.use("/notifications", NotificationRoute);
apiV1.use("/flash-sales", FlashSaleRoute);

app.use("/api/v1", apiV1);

// Static for uploads
const UPLOAD_ROOT = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(UPLOAD_ROOT));

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to PESkinPro Backend API",
        version: "1.0.0",
        docs: "/api-docs"
    });
});

// Sentry Error Handler (Must be before any other error middleware)
Sentry.setupExpressErrorHandler(app);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    // Sentry Error ID
    // @ts-ignore
    const sentryId = res.sentry;
    if (sentryId) {
        console.error("Sentry Error ID:", sentryId);
    }

    // Log the error for debugging
    console.error("❌ Global Backend Error:", {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        status: err.status || 500
    });

    // Determine status code
    let statusCode = err.status || 500;
    let message = err.message || "Something went wrong on our server.";
    let errorCode = err.code || "INTERNAL_SERVER_ERROR";

    // Handle Sequelize Errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        message = err.errors.map((e: any) => e.message).join(", ");
        errorCode = "VALIDATION_ERROR";
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        data: null,
        error: {
            code: errorCode,
            details: process.env.NODE_ENV === "development" ? err.stack : undefined,
            sentry_id: sentryId
        }
    });
});


export default app;
