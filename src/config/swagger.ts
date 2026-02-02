import swaggerJsdoc from "swagger-jsdoc";
import { PORT } from "./env";

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
                url: `http://localhost:${PORT}/api/v1`,
                description: "Local Development Server",
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
    apis: ["./src/modules/**/*.ts", "./src/server.ts"], // Path to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
