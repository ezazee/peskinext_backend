import { Request, Response } from "express";
import multer from "multer";
import path, { dirname } from "path";
import fs from "fs";
import sharp from "sharp";
// @ts-ignore
import { fileURLToPath } from "url";

// Manually define __dirname for ESM if needed, though with standard TS compile it might use CommonJS.
// Assuming "module": "commonjs" in tsconfig, we can just use __dirname.
// But to match the logic roughly if we were ESM:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Since we are likely compiling to CJS, let's use process.cwd() or similar for standard uploads relative path
// or assume __dirname is available if configured correctly.
// Let's stick to standard practice: use absolute path based on process.cwd() or build config.
// The original code used import.meta.url.

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".avi", ".webm"];
const videoExtensions = [".mp4", ".mov", ".avi", ".webm"];

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        let folder;
        const type = req.body.type;
        if (type === "article") {
            folder = path.join(UPLOAD_ROOT, "articles");
        } else if (type === "user") {
            folder = path.join(UPLOAD_ROOT, "users");
        } else if (type === "branding") {
            folder = path.join(UPLOAD_ROOT, "branding");
        } else if (type === "review") {
            folder = path.join(UPLOAD_ROOT, "reviews");
        } else {
            folder = path.join(UPLOAD_ROOT, "products");
        }

        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req: any, file: any, cb: any) => {
        const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, safeName);
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("File type tidak diperbolehkan"), false);
    }
};

const upload = multer({ storage, fileFilter });

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

export const handleUploadSingle = async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const { filename, path: filePath, destination } = req.file;
    const ext = path.extname(filename).toLowerCase();
    const isVideo = videoExtensions.includes(ext);

    let folder = req.body.type || "products";
    if (folder === "review") folder = "reviews";
    if (!["products", "articles", "users", "branding", "reviews"].includes(folder)) {
        folder = "products";
    }

    if (isVideo) {
        // Just return the path for videos, don't use Sharp
        const videoUrl = `/uploads/${folder}/${filename}`;
        return res.json({ imageUrl: videoUrl });
    }

    const nameWithoutExt = path.basename(filename, ext);
    const outputFilename = `${nameWithoutExt}.webp`;
    const outputPath = path.join(destination, outputFilename);

    try {
        // Optimization with Sharp (The "Balancer")
        await sharp(filePath)
            .resize({ width: 1920, withoutEnlargement: true }) // Limit size for performance
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Delete original file to save space
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const imageUrl = `/uploads/${folder}/${outputFilename}`;
        res.json({ imageUrl });
    } catch (error: any) {
        console.error("❌ Sharp Error:", error);
        // Fallback to original if sharp fails
        const imageUrl = `/uploads/${folder}/${filename}`;
        res.json({ imageUrl });
    }
};

export const handleUploadMultiple = async (req: Request, res: Response) => {
    const files = req.files as any[];
    if (!files || files.length === 0)
        return res.status(400).json({ error: "File tidak ditemukan" });

    let folder = req.body.type || "products";
    if (folder === "review") folder = "reviews";
    if (!["products", "articles", "users", "branding", "reviews"].includes(folder)) {
        folder = "products";
    }

    try {
        const optimizedUrls = await Promise.all(files.map(async (file) => {
            const { filename, path: filePath, destination } = file;
            const ext = path.extname(filename).toLowerCase();
            const isVideo = videoExtensions.includes(ext);

            if (isVideo) {
                return `/uploads/${folder}/${filename}`;
            }

            const nameWithoutExt = path.basename(filename, ext);
            const outputFilename = `${nameWithoutExt}.webp`;
            const outputPath = path.join(destination, outputFilename);

            try {
                await sharp(filePath)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return `/uploads/${folder}/${outputFilename}`;
            } catch (sharpError) {
                console.error("❌ Sharp Error (Multiple):", sharpError);
                return `/uploads/${folder}/${filename}`;
            }
        }));

        res.json({ urls: optimizedUrls });
    } catch (error) {
        // Fallback for multiple
        const urls = files.map(file => {
            return `/uploads/${folder}/${file.filename}`;
        });
        res.json({ urls });
    }
};
