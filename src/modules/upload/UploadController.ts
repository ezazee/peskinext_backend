import { Request, Response } from "express";
import multer from "multer";
import path, { dirname } from "path";
import fs from "fs";
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

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        let folder;
        if (req.body.type === "article") {
            folder = path.join(UPLOAD_ROOT, "articles");
        } else if (req.body.type === "user") {
            folder = path.join(UPLOAD_ROOT, "users");
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

export const handleUploadSingle = (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    let folder = "products";
    if (req.body.type === "article") folder = "articles";
    if (req.body.type === "user") folder = "users";

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

    res.json({ imageUrl });
};

export const handleUploadMultiple = (req: Request, res: Response) => {
    // multer types for req.files array
    const files = req.files as any[];
    if (!files || files.length === 0)
        return res.status(400).json({ error: "File tidak ditemukan" });

    const urls = files.map(file => {
        return `${req.protocol}://${req.get("host")}/uploads/${req.body.type === "article" ? "articles" : "products"
            }/${file.filename}`;
    });

    res.json({ urls });
};
