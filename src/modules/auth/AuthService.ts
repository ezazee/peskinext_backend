import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Users from "../user/models/UserModel";
import { ACCESS_SECRET, REFRESH_SECRET } from "../../config/env";
import * as crypto from "crypto";
import { sendForgotPasswordEmail } from "../../services/EmailService";

const ADMIN_ROLES = new Set(["admin", "writter", "management"]);

export const signAccess = (user: Users, aud: string) => {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role, aud },
        ACCESS_SECRET,
        { expiresIn: "2h" }
    );
};

export const signRefresh = async (user: Users, aud: string) => {
    const token = jwt.sign(
        { sub: user.id, aud },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // Save token to database for security (Revocation support)
    user.refresh_token = token;
    await user.save();

    return token;
};

export const loginUser = async (emailOrPhone: string, password: string, isAdmin: boolean) => {
    // Search user by email OR phone
    // We assume the input 'email' from controller might be a phone number

    const user = await Users.findOne({
        where: {
            [Op.or]: [
                { email: emailOrPhone },
                { no_telp: emailOrPhone }
            ]
        }
    });

    if (!user) {

        throw new Error("Email/Phone atau password salah");
    }

    const role = String(user.role || "").toLowerCase();
    // console.log("User found:", user.email, "Role:", role);

    if (isAdmin) {
        if (!ADMIN_ROLES.has(role)) throw new Error("Access denied");
    } else {
        if (role !== "user") throw new Error("Access denied");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {

        throw new Error("Email atau password salah");
    }

    return user;
};

export const registerUser = async (data: any) => {
    const { first_name, last_name, email, password, phone } = data;

    // Check if user exists
    const existingUser = await Users.findOne({
        where: {
            [Op.or]: [
                { email },
                { no_telp: phone }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email) throw new Error("Email sudah terdaftar");
        if (existingUser.no_telp === phone) throw new Error("Nomor HP sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${first_name} ${last_name}`;

    const newUser = await Users.create({
        firstName: first_name,
        lastName: last_name,
        name,
        email,
        password: hashedPassword,
        no_telp: phone,
        status: "active",
        role: "user",
        images: "/images/avatar/default-avatar.png" // Default avatar
    });

    return newUser;
};

export const verifyRefreshToken = async (token: string, audExpected: string) => {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET) as any;
        const user = await Users.findByPk(payload.sub);
        if (!user) throw new Error("User not found");

        // SECURITY: Check if token matches the one in DB (Revocation check)
        if (user.refresh_token !== token) {
            throw new Error("Refresh token reused or revoked");
        }

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

export const forgotPassword = async (email: string) => {
    const user = await Users.findOne({ where: { email } });
    if (!user) throw new Error("Email tidak ditemukan");

    // Check if user is registered via Google
    if (user.is_google) {
        throw new Error("Akun ini terdaftar dengan Google. Silakan login menggunakan Google.");
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1800000); // 30 minutes

    user.reset_password_token = token;
    user.reset_password_expires = expires;
    await user.save();

    // Send Email
    await sendForgotPasswordEmail(user.email, user.name, token);

    return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await Users.findOne({
        where: {
            reset_password_token: token,
            reset_password_expires: { [Op.gt]: new Date() } // Expires > Now
        }
    });

    if (!user) throw new Error("Token tidak valid atau sudah kadaluarsa");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.reset_password_token = null as any; // Clear token
    user.reset_password_expires = null as any;
    await user.save();

    return true;
};
