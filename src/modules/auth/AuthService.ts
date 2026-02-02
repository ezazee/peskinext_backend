import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../user/models/UserModel";
import { ACCESS_SECRET, REFRESH_SECRET } from "../../config/env";

const ADMIN_ROLES = new Set(["admin", "writter", "management"]);

export const signAccess = (user: Users, aud: string) => {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role, aud },
        ACCESS_SECRET,
        { expiresIn: "2h" }
    );
};

export const signRefresh = (user: Users, aud: string) => {
    return jwt.sign(
        { sub: user.id, aud },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

export const loginUser = async (email: string, password: string, isAdmin: boolean) => {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new Error("Email atau password salah");

    const role = String(user.role || "").toLowerCase();

    if (isAdmin) {
        if (!ADMIN_ROLES.has(role)) throw new Error("Access denied");
    } else {
        if (role !== "user") throw new Error("Access denied");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Email atau password salah");

    return user;
};

export const verifyRefreshToken = async (token: string, audExpected: string) => {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET) as any;
        const user = await Users.findByPk(payload.sub);
        if (!user) throw new Error("User not found");

        if (audExpected === "admin") {
            const role = String(user.role || "").toLowerCase();
            if (!ADMIN_ROLES.has(role)) throw new Error("Role unauthorized");
        } else if (payload.aud !== audExpected) {
            throw new Error("Invalid audience");
        }

        return user;
    } catch (error) {
        throw new Error("Refresh token invalid/expired");
    }
};
