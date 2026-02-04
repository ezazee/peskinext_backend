import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { PORT } from '../config/env';

console.log('Generating Swagger JSON...');

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
                description: "API Server (Configured)",
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
    // In build time, we are running from root or src, so we point to TS files
    apis: ["./src/modules/**/*.ts", "./src/server.ts"],
};

try {
    const swaggerSpec = swaggerJsdoc(options);
    const outputPath = path.join(process.cwd(), 'swagger.json');
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`Swagger JSON generated at ${outputPath}`);
} catch (error) {
    console.error('Failed to generate Swagger JSON:', error);
    process.exit(1);
}
