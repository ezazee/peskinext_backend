import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import dotenv from "dotenv";

dotenv.config();

const minioEndpoint = process.env.MINIO_ENDPOINT || "";
const accessKeyId = process.env.MINIO_ACCESS_KEY || "";
const secretAccessKey = process.env.MINIO_SECRET_KEY || "";
const region = process.env.MINIO_REGION || "us-east-1";

// For local/traefik.me testing with self-signed certs
if (minioEndpoint.includes("traefik.me")) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Custom agent to handle self-signed certificates or traefik.me local SSL

const agentConfig = {
    keepAlive: true,
    rejectUnauthorized: false, // Set to false to allow self-signed/local certs
};

export const s3Client = new S3Client({
    endpoint: minioEndpoint,
    region: region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true, // Required for Minio
    requestHandler: new NodeHttpHandler({
        httpAgent: new HttpAgent(agentConfig),
        httpsAgent: new HttpsAgent(agentConfig),
    }),
});

export const bucketName = process.env.MINIO_BUCKET || "peskinpro-bucket";
export const publicUrl = process.env.MINIO_PUBLIC_URL || minioEndpoint;

