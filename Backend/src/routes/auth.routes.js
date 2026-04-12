import express from "express";
import {
  authLoginController,
  authRegisterController,
  authVerifyEmailController,
  authGoogleCallbackController,
  authCreatePassword,
  authGetMeController,
  authLogoutController,
  authVerifyOtpController,
  authResendOtpController,
  authForgetPasswordController,
  authResetPasswordController,
} from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import passport from "../config/passport.js";

const authRouter = express.Router();

// ── Standard Auth ───────────────────────────────────────────────────────────
authRouter.post("/register", validateRegister, authRegisterController);
authRouter.post("/login", validateLogin, authLoginController);
authRouter.get("/verify-email/:token", authVerifyEmailController);
authRouter.post("/logout", authMiddleware, authLogoutController);
authRouter.get("/me", authMiddleware, authGetMeController);

// ── OTP ─────────────────────────────────────────────────────────────────────
authRouter.post("/verify-otp", authVerifyOtpController);
authRouter.post("/resend-otp", authResendOtpController);

// ── Password Reset ───────────────────────────────────────────────────────────
authRouter.post("/forgot-password", authForgetPasswordController);
authRouter.post("/reset-password", authResetPasswordController);
authRouter.post("/set-password", authCreatePassword);

// ── Google OAuth ─────────────────────────────────────────────────────────────
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=google_failed",
  }),
  authGoogleCallbackController
);

export default authRouter;