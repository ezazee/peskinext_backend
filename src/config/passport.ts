import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../modules/user/models/UserModel';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.AUTH_GOOGLE_ID || '',
            clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
            callbackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ where: { email: profile.emails?.[0].value } });

                if (user) {
                    // Update user with latest google info (fix for empty names/avatars)
                    const name = profile.displayName;
                    const avatar = profile.photos?.[0].value;

                    if (name || avatar) {
                        const emailName = profile.emails?.[0]?.value.split("@")[0];
                        user.name = name || user.name || emailName || "User"; // Ensure string

                        // Only update avatar from Google if user has no avatar or is using default
                        // We check if it's NOT a custom uploaded one (which usually has "uploads/" in path)
                        // Or simply if it is empty. 
                        // But since we want to allow custom uploads to persist, we shouldn't blindly overwrite.
                        // Let's only overwrite if current is null/empty.
                        if (avatar && (!user.images || user.images === "")) {
                            user.images = avatar;
                        }

                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user if not exists
                const email = profile.emails?.[0].value;
                const name = profile.displayName || email?.split("@")[0] || "User";
                const avatar = profile.photos?.[0].value;

                if (!email) return done(new Error('No email found directly from Google'));

                if (!user) {
                    const crypto = require("crypto");
                    const randomPassword = crypto.randomBytes(16).toString("hex");
                    const slugify = require("slugify");
                    const slug = slugify(name, { lower: true, strict: true }) + "-" + Math.floor(Math.random() * 1000);

                    user = await User.create({
                        name: name,
                        email: email,
                        password: randomPassword,
                        role: 'user',
                        images: avatar,
                        slug: slug,
                        is_google: true,
                        status: "active",
                        email_verified_at: new Date()
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error("Google Auth Error:", error);
                return done(error, false);
            }
        }
    )
);

export default passport;
