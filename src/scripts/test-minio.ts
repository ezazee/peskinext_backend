import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent as HttpsAgent } from "https";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.MINIO_ENDPOINT || "";
const accessKeyId = process.env.MINIO_ACCESS_KEY || "";
const secretAccessKey = process.env.MINIO_SECRET_KEY || "";

console.log("🔍 Testing Minio Connection...");
console.log("Endpoint:", endpoint);
console.log("Access Key:", accessKeyId);

// Force bypass for test
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new S3Client({
    endpoint: endpoint,
    region: "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        httpsAgent: new HttpsAgent({ rejectUnauthorized: false }),
    }),
});

async function test() {
    try {
        const data = await client.send(new ListBucketsCommand({}));
        console.log("✅ Success! Buckets found:", data.Buckets?.map(b => b.Name));
    } catch (err: any) {
        console.error("❌ Connection Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.$metadata) {
            console.error("Metadata:", err.$metadata);
        }
    }
}

test();
