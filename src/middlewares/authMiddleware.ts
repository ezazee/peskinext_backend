import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { ACCESS_SECRET } from "../config/env";

const pickToken = (req: Request, cookieName?: string): string | null => {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookie = cookieName ? req.cookies?.[cookieName] : null;
    return bearer || cookie || null;
};

export const requireAccess = (audExpected?: string, rolesAllowed?: string[]) => {
    const allow = new Set((rolesAllowed || []).map((r) => String(r).toLowerCase()));

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Try to get token from Authorization header first
            const header = req.headers.authorization || "";
            let token = header.startsWith("Bearer ") ? header.slice(7) : null;

            // If no header token, try to extract from session_token cookie
            if (!token && req.cookies?.session_token) {
                const sessionValue = req.cookies.session_token;
                console.log("🍪 Session cookie found, parsing...");
                // Parse session token format: userId:timestamp:accessToken
                const parts = sessionValue.split(':');
                if (parts.length >= 3) {
                    token = parts.slice(2).join(':'); // Reconstruct token if it contains colons
                    console.log("✅ Token extracted from cookie");
                } else {
                    console.log("❌ Invalid session cookie format");
                }
            }

            if (!token) {
                console.log("❌ No token found - cookies:", Object.keys(req.cookies || {}));
                return res.status(401).json({ message: "Unauthorized" });
            }

            const payload = jwt.verify(token, ACCESS_SECRET) as any; // {sub,role,aud,...}

            if (audExpected && payload.aud !== audExpected) {
                return res.status(401).json({ message: "Invalid audience" });
            }

            if (rolesAllowed && rolesAllowed.length > 0) {
                const role = String(payload.role || "").toLowerCase();
                if (!allow.has(role)) return res.status(403).json({ message: "Forbidden" });
            }

            req.user = payload;
            next();
        } catch (_) {
            return res.status(401).json({ message: "Token invalid/expired" });
        }
    };
};

export const requireAdminAuth = (roles: string[] = ["admin", "writter", "management"]) =>
    requireAccess("admin", roles);

export const requireUserAuth = () =>
    requireAccess("user", ["user"]);
