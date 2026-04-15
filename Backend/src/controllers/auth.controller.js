import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import otpModel from "../models/otp.model.js";
import blacklistModel from "../models/blacklist.model.js";

export const authRegisterController = async (req, res, next) => {
  try {
    const { username, email, password, contact, role } = req.body;

    const userAlreadyExists = await userModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    console.log(userAlreadyExists);

    if (userAlreadyExists) {
      return res.status(400).json({
        message: "User with the given email or username already existssss",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      contact,
      role,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpModel.create({ email, otp, type: 'email_verification' });

    await sendEmail({
      to: newUser.email,
      subject: "JSS Connect — Verification Code",
      text: `JSS Connect\n\nYour verification code is: ${otp}\nCode expires in 5 minutes.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSS Connect Verification Code</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0052cc; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; text-align: center; }
        .content p { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 25px; }
        .code-box { display: inline-block; padding: 20px 40px; background-color: #f0f4f8; border: 1px solid #dce4ec; border-radius: 6px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: 700; color: #0052cc; letter-spacing: 8px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>JSS Connect</h1>
        </div>
        <div class="content">
            <h2>Welcome to the Community, ${newUser.username}!</h2>
            <p>Please use the following code to verify your email. This code will expire in 5 minutes.</p>
            <div class="code-box">
                <div class="code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #888;">If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} JSS Connect. All rights reserved.<br>
            Please do not reply to this automated email.
        </div>
    </div>
</body>
</html>
      `,
    });

    res.status(201).json({
      message:
        "user registered successfully, please verify your email to activate your account",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong during registration.";
    return next(err);
  }
};

export const authVerifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
      message:
        "Email verified successfully, you can now log in to your account",
    });
  } catch (err) {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong during email verification.";
    return next(err);
  }
};

export const authLoginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(409).json({
        message: "user does not exist with this email...",
      });
    }
    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }
    if (!user.password) {
      return res.status(403).json({
        message: "No password set. Please log in with Google or set a password first.",
        id: user._id,
        email: user.email,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(409).json({
        message: "You have entered the wrong password...",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      message: "User logged in successfully.",
    });
  } catch (err) {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong while logging in.";
    return next(err);
  }
};

export const authCreatePassword = async (req, res, next) => {
  try {
    const { id, password, confirmPass } = req.body;
    if (!id || !password || !confirmPass) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const user = await userModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist.",
      });
    }

    if (password !== confirmPass) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password created successfully. You can now log in.",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong while setting the password.";
    return next(err);
  }
};

export const authGoogleCallbackController = async (req, res, next) => {

  try {
    const user = req.user;

    if (!user) {
      return res.status(409).json({
        message: "There is the issue in signing in..."
      })
    }

    const email = user.emails[0].value;
    const verified = user.emails[0].verified;
    const Google_id = user.id;
    const username = user.displayName;
    const profilePic = user.photos[0].value;

    const alreadyUser = await userModel.findOne({ email });

    if (!alreadyUser) {
      const newUser = await userModel.create({
        username: username,
        email: email,
        googleId: Google_id,
        profilePicture: profilePic,
        verified: verified,
      })

      const token = jwt.sign({
        id : newUser._id,
        email : newUser.email,
      }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.redirect(`http://localhost:5173/set-password?id=${newUser._id}`);

    }

    if(!alreadyUser.googleId){
      alreadyUser.googleId = Google_id;
      alreadyUser.verified = true;
      await alreadyUser.save();
    }


    const token = jwt.sign({
      id : alreadyUser._id,
      email : alreadyUser.email,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    
    res.cookie("token" , token , {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000*7, // 1 week
    })

    return res.redirect("http://localhost:5173/");

  } catch (err) {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong while logging in.";
    return next(err);
  }
};

export async function authGetMeController(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message =
      err.message || "Something went wrong while fetching user data.";
    return next(err);
  }
}

export async function authVerifyOtpController(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      const err = new Error("Email and OTP are required.");
      err.statusCode = 400;
      return next(err);
    }

    const storedOtpDoc = await otpModel.findOne({ email, type: 'email_verification' });
    const storedOtp = storedOtpDoc ? storedOtpDoc.otp : null;

    if (!storedOtp) {
      const err = new Error(
        "OTP expired or not found. Please request a new one.",
      );
      err.statusCode = 400;
      return next(err);
    }

    if (storedOtp != otp) {
      const err = new Error("Invalid OTP. Please try again.");
      err.statusCode = 401;
      return next(err);
    }

    // OTP is valid, mark user as verified
    const user = await userModel.findOne({ email });
    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      return next(err);
    }

    user.verified = true;
    await user.save();
    await otpModel.deleteMany({ email, type: 'email_verification' });

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message =
      err.message || "Something went wrong during OTP verification.";
    return next(err);
  }
}

export async function authLogoutController(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      const err = new Error("No active session found.");
      err.statusCode = 400;
      return next(err);
    }
    await blacklistModel.create({ token });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong while logging out.";
    return next(err);
  }
}

export async function authResendOtpController(req, res, next) {
  try {
    // ── 1. Validate body ───────────────────────────────────────────────────
    if (!req.body) {
      const err = new Error("Request body is missing.");
      err.statusCode = 400;
      return next(err);
    }

    const { email } = req.body;

    if (!email) {
      const err = new Error("Email is required.");
      err.statusCode = 400;
      return next(err);
    }
    // ── 2. Find user ───────────────────────────────────────────────────────
    const user = await userModel.findOne({ email });
    if (!user) {
      const err = new Error("No account found with this email address.");
      err.statusCode = 404;
      return next(err);
    }

    if (user.verified) {
      const err = new Error("This email is already verified. You can sign in.");
      err.statusCode = 400;
      return next(err);
    }

    // ── 3. Rate limiting — max 3 resends per 10 minutes ───────────────────
    const recentOtps = await otpModel.countDocuments({ email, type: 'email_verification' });

    if (recentOtps >= 3) {
      const err = new Error(
        "Too many OTP requests. Please wait 10 minutes before trying again.",
      );
      err.statusCode = 429;
      return next(err);
    }

    // ── 4. Delete old OTP and generate new one ─────────────────────────────
    await otpModel.deleteMany({ email, type: 'email_verification' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpModel.create({ email, otp, type: 'email_verification' });

    // ── 5. Send branded email ──────────────────────────────────────────────
    await sendEmail({
      to: email,
      subject: "JSS Connect — Verification Code",

      text: `JSS Connect\n\nYour verification code is: ${otp}\nCode expires in 5 minutes.`,

      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSS Connect Verification Code</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0052cc; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; text-align: center; }
        .content p { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 25px; }
        .code-box { display: inline-block; padding: 20px 40px; background-color: #f0f4f8; border: 1px solid #dce4ec; border-radius: 6px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: 700; color: #0052cc; letter-spacing: 8px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>JSS Connect</h1>
        </div>
        <div class="content">
            <h2>Your Verification Code</h2>
            <p>We received a request to verify your email address. Please use the following code to complete the process. This code will expire in 5 minutes.</p>
            <div class="code-box">
                <div class="code">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #888;">If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} JSS Connect. All rights reserved.<br>
            Please do not reply to this automated email.
        </div>
    </div>
</body>
</html>
      `.trim(),
    });

    return res.status(200).json({
      message: "New verification code sent to your email.",
      expiresIn: 300, // seconds
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    err.statusCode = err.statusCode || 500;
    err.message =
      err.message || "Something went wrong while resending the code.";
    return next(err);
  }
}

export async function authForgetPasswordController(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      const err = new Error("Email is required.");
      err.statusCode = 400;
      return next(err);
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      const err = new Error("No account found with this email address.");
      err.statusCode = 404;
      return next(err);
    }

    if (user.verified === false) {
      const err = new Error(
        "Email not verified. Please verify your email before resetting password.",
      );
      err.statusCode = 403;
      return next(err);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpModel.deleteMany({ email, type: 'password_reset' });
    await otpModel.create({ email, otp, type: 'password_reset' });

    const resetUrl = `http://localhost:5173/forgot-password?email=${encodeURIComponent(email)}&otp=${otp}`;

    await sendEmail({
      to: email,
      subject: "JSS Connect — Password Reset",
      text: `JSS Connect\n\nYour password reset code is: ${otp}\nReset link: ${resetUrl}\nExpires in 5 minutes.`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSS Connect Password Reset</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0052cc; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; text-align: center; }
        .content p { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 25px; }
        .code-box { display: inline-block; padding: 20px 40px; background-color: #f0f4f8; border: 1px solid #dce4ec; border-radius: 6px; margin: 10px 0 30px; }
        .code { font-size: 32px; font-weight: 700; color: #0052cc; letter-spacing: 8px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #0052cc; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
        .button:hover { background-color: #0043a6; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>JSS Connect</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. You can use the code below or click the button to proceed. This code and link will expire in 5 minutes.</p>
            <div class="code-box">
                <div class="code">${otp}</div>
            </div>
            <div>
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} JSS Connect. All rights reserved.<br>
            Please do not reply to this automated email.
        </div>
    </div>
</body>
</html>
      `.trim(),
    });

    return res.status(200).json({
      message: "Password reset OTP sent to your email successfully.",
      email,
    });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message =
      err.message || "Something went wrong while sending reset code.";
    return next(err);
  }
}

export async function authResetPasswordController(req, res, next) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      const err = new Error("Email, OTP and new password are required.");
      err.statusCode = 400;
      return next(err);
    }

    const storedOtpDoc = await otpModel.findOne({ email, type: 'password_reset' });
    if (!storedOtpDoc || storedOtpDoc.otp != otp) {
      const err = new Error("Invalid or expired OTP.");
      err.statusCode = 400;
      return next(err);
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      const err = new Error("No account found with this email address.");
      err.statusCode = 404;
      return next(err);
    }


    if(user.verified === false) {
      const err = new Error(
        "Email not verified. Please verify your email before resetting password.",
      );
      err.statusCode = 403;
      return next(err);
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      const err = new Error("New password cannot be the same as the old password.");
      err.statusCode = 400;
      return next(err);
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    
    await otpModel.deleteMany({ email, type: 'password_reset' });

    return res.status(200).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message =
      err.message || "Something went wrong while resetting password.";
    return next(err);
  }
}

