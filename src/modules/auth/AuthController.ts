import { Request, Response } from "express";
import * as AuthService from "./AuthService";

const setRefreshCookie = (res: Response, name: string, token: string) => {
    const secure = process.env.NODE_ENV === "production";
    res.cookie(name, token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/api/v1",
    });
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email & password wajib" });

        const user = await AuthService.loginUser(email, password, true);
        const access = AuthService.signAccess(user, "admin");
        const refresh = AuthService.signRefresh(user, "admin");

        setRefreshCookie(res, "admin_refresh_token", refresh);
        return res.json({
            message: "Login admin berhasil",
            token: access,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        const status = error.message.includes("Access denied") ? 403 : 401;
        return res.status(status).json({ message: error.message });
    }
};

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email & password wajib" });

        const user = await AuthService.loginUser(email, password, false);
        const access = AuthService.signAccess(user, "user");
        const refresh = AuthService.signRefresh(user, "user");

        setRefreshCookie(res, "user_refresh_token", refresh);
        return res.json({
            message: "Login user berhasil",
            token: access,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        const status = error.message.includes("Access denied") ? 403 : 401;
        return res.status(status).json({ message: error.message });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const raw = req.cookies?.admin_refresh_token || req.cookies?.user_refresh_token;
        if (!raw) return res.status(401).json({ message: "No refresh token" });

        // Determine audience based on cookie name or try both
        let aud = "user";
        if (req.cookies?.admin_refresh_token) aud = "admin";

        const user = await AuthService.verifyRefreshToken(raw, aud);
        const access = AuthService.signAccess(user, aud);

        return res.json({ token: access });
    } catch (error: any) {
        return res.status(401).json({ message: error.message });
    }
};

export const adminLogout = (req: Request, res: Response) => {
    res.clearCookie("admin_refresh_token", { path: "/api/v1" });
    return res.json({ message: "Logout admin berhasil" });
};

export const userLogout = (req: Request, res: Response) => {
    res.clearCookie("user_refresh_token", { path: "/api/v1" });
    return res.json({ message: "Logout user berhasil" });
};

export const getMe = (req: Request, res: Response) => {
    res.json({ ok: true, user: req.user });
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any; // Typed properly in real scenario
        if (!user) return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=auth_failed`);

        const access = AuthService.signAccess(user, "user");
        const refresh = AuthService.signRefresh(user, "user");

        // Set refresh token cookie
        setRefreshCookie(res, "user_refresh_token", refresh);

        // Redirect to frontend with access token
        // Frontend should handle extracting token from URL and storing it/using it
        // Or we can just set the session cookie that frontend expects (if on shareable domain)
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/oauth/callback?token=${access}&uid=${user.id}`);
    } catch (error) {
        console.error("Google Callback Error:", error);
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=server_error`);
    }
};
