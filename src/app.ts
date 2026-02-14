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

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(hpp());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
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
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "*",
    credentials: true
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
import NotificationRoute from "./modules/notification/NotificationRoute";
apiV1.use("/notifications", NotificationRoute);

app.use("/api/v1", apiV1);

// Static for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
    // Optional: Sentry ID in response
    // @ts-ignore
    if (res.sentry) {
        // @ts-ignore
        console.error("Sentry Error ID:", res.sentry);
    }

    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error",
        // @ts-ignore
        sentry_id: res.sentry
    });
});

export default app;
