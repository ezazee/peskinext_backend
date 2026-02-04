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
            description: "API Documentation for PESkinPro E-Commerce Backend",
            contact: {
                name: "Developer",
            },
        },
        servers: [
            {
                url: "/api/v1",
                description: "Current Server (Relative)",
            },
            {
                url: process.env.NEXT_PUBLIC_API_URL || `http://localhost:${PORT}/api/v1`,
                description: "API Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
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
