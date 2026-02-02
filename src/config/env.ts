import dotenv from "dotenv";
dotenv.config();

export const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY as string;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET belum di .env");
}

export const PORT = parseInt(process.env.PORT || "5000", 10);

export const CORS_WHITELIST: string[] = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
