import swaggerJsdoc from "swagger-jsdoc";
import { PORT } from "./env";

// Adjust path based on environment (development vs production)
const isProduction = process.env.NODE_ENV === "production";
const apiPaths = isProduction
    ? ["./dist/modules/**/*.js", "./dist/server.js"]
    : ["./src/modules/**/*.ts", "./src/server.ts"];

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PESkinPro Backend API",
            version: "1.0.0",
            description: "Dokumentasi API untuk Backend E-Commerce PE SkinPro. Gunakan API ini untuk mengelola data produk, pesanan, dan pengguna.",
            contact: {
                name: "Developer Team",
            },
        },
        tags: [
            { name: "Auth", description: "Sistem masuk (login), daftar (register), dan keamanan akun." },
            { name: "User - Customer", description: "Pengelolaan profil pelanggan dan alamat pengiriman." },
            { name: "Product - Storefront", description: "Halaman produk yang dilihat oleh pembeli." },
            { name: "Product - Admin", description: "Pengelolaan stok, varian, dan data produk (Khusus Admin)." },
            { name: "Order & Checkout", description: "Proses pembelian dari keranjang hingga pembayaran." },
            { name: "Content & Support", description: "Artikel blog, FAQ, Banner, dan Pengaturan Sistem." },
        ],
        servers: [
            {
                url: "/api/v1",
                description: "Server Saat Ini (Relative)",
            },
            {
                url: process.env.NEXT_PUBLIC_API_URL || `http://localhost:${PORT}/api/v1`,
                description: "API Server Lokal",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Masukkan Token JWT (tanpa kata Bearer) untuk mengakses endpoint yang dilindungi.",
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        error: { type: "string", example: "Pesan error di sini" }
                    }
                },
                Success: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Operasi berhasil" }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: apiPaths, // Path to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
