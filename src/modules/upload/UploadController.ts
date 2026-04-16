import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName, publicUrl } from "../../libs/s3";

// Storage strategy: Memory (we process and upload, never save to server disk)
const storage = multer.memoryStorage();

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".avi", ".webm"];
const videoExtensions = [".mp4", ".mov", ".avi", ".webm"];

const fileFilter = (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("File type tidak diperbolehkan"), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

/**
 * Helper to upload a buffer to Minio
 */
async function uploadToMinio(buffer: Buffer, filename: string, folder: string, contentType: string): Promise<string> {
    const key = `${folder}/${filename}`;
    
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // Optional: ACL: "public-read" - depends on Minio bucket policy
    }));

    // Generate public URL
    // Standard format: http://endpoint/bucket/key or http://public-url/bucket/key
    // If using forcePathStyle: true, it's usually /bucket/key
    return `${publicUrl}/${bucketName}/${key}`;
}

export const handleUploadSingle = async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const { originalname, buffer, mimetype } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const isVideo = videoExtensions.includes(ext);

    let folder = req.body.type || "products";
    if (folder === "review") folder = "reviews";
    if (!["products", "articles", "users", "branding", "reviews"].includes(folder)) {
        folder = "products";
    }

    const timestamp = Date.now();
    const safeName = originalname.replace(/\s+/g, "_").split('.')[0];

    try {
        let finalBuffer = buffer;
        let finalFilename = `${timestamp}-${safeName}${ext}`;
        let finalMimeType = mimetype;

        if (!isVideo) {
            // Optimization with Sharp
            const image = sharp(buffer);
            const metadata = await image.metadata();
            
            // Auto-detect transparency
            const hasAlpha = metadata.hasAlpha;
            const isPng = metadata.format === 'png';

            // If it's a PNG, we ALWAYS keep it as PNG to guarantee transparency.
            // For other formats (JPEG/WebP), we optimize via WebP.
            if (isPng) {
                finalBuffer = await image
                    .resize({ width: 1920, withoutEnlargement: true })
                    .png({ quality: 80, compressionLevel: 9 })
                    .toBuffer();
                finalFilename = `${timestamp}-${safeName}.png`;
                finalMimeType = "image/png";
            } else {
                // For non-PNG (like JPEGs), converting to WebP is best for performance
                finalBuffer = await image
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ 
                        quality: 80, 
                        lossless: hasAlpha,
                        alphaQuality: 100
                    })
                    .toBuffer();
                finalFilename = `${timestamp}-${safeName}.webp`;
                finalMimeType = "image/webp";
            }

        }



        const fileUrl = await uploadToMinio(finalBuffer, finalFilename, folder, finalMimeType);
        res.json({ success: true, imageUrl: fileUrl, file_url: fileUrl });
    } catch (error: any) {
        console.error("❌ Minio Upload Error (Full Details):", {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack,
            requestId: error.$metadata?.requestId
        });
        res.status(500).json({ error: "Gagal mengunggah file ke storage cloud" });
    }
};

export const handleUploadMultiple = async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
        return res.status(400).json({ error: "File tidak ditemukan" });

    let folder = req.body.type || "products";
    if (folder === "review") folder = "reviews";
    if (!["products", "articles", "users", "branding", "reviews"].includes(folder)) {
        folder = "products";
    }

    try {
        const uploadPromises = files.map(async (file) => {
            const { originalname, buffer, mimetype } = file;
            const ext = path.extname(originalname).toLowerCase();
            const isVideo = videoExtensions.includes(ext);
            const timestamp = Date.now();
            const safeName = originalname.replace(/\s+/g, "_").split('.')[0];

            let finalBuffer = buffer;
            let finalFilename = `${timestamp}-${safeName}${ext}`;
            let finalMimeType = mimetype;

            if (!isVideo) {
                finalBuffer = await sharp(buffer)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();
                
                finalFilename = `${timestamp}-${safeName}.webp`;
                finalMimeType = "image/webp";
            }

            return await uploadToMinio(finalBuffer, finalFilename, folder, finalMimeType);
        });

        const urls = await Promise.all(uploadPromises);
        res.json({ success: true, urls, file_urls: urls });
    } catch (error: any) {
        console.error("❌ Minio Multiple Upload Error (Full Details):", {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({ error: "Gagal mengunggah beberapa file ke storage cloud" });
    }
};


