import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import developerModel from "../models/developer.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import otpModel from "../models/otp.model.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

const rpName = "JSS Connect Developer App";
const rpID = "localhost";
const origin = `http://${rpID}:5173`;

// Helper: Ensure the developer account exists
const getOrCreateDeveloper = async (email) => {
  let developer = await developerModel.findOne({ email });
  if (!developer) {
    developer = await developerModel.create({ email });
  }
  return developer;
};

export const verifyMaster = (req, res) => {
  const { devId, devPassword } = req.body;
  const masterId = process.env.MASTER_DEV_ID || "supreme_admin";
  const masterPassword = process.env.MASTER_DEV_PASSWORD || "jss_secure_pass_2026";

  if (!devId || !devPassword) {
    return res.status(400).json({ error: "Credentials required" });
  }
  if (devId !== masterId || devPassword !== masterPassword) {
    return res.status(403).json({ error: "Invalid master credentials. Access Denied." });
  }
  return res.json({ verified: true });
};

export const sendDeveloperOtp = async (req, res) => {
  const { email, devId, devPassword } = req.body;
  if (!email || !devId || !devPassword) {
    return res.status(400).json({ error: "Email, Developer ID, and Password required" });
  }

  const masterId = process.env.MASTER_DEV_ID || "supreme_admin";
  const masterPassword = process.env.MASTER_DEV_PASSWORD || "jss_secure_pass_2026";

  if (devId !== masterId || devPassword !== masterPassword) {
    return res.status(403).json({ error: "Invalid master credentials. Registration blocked." });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await otpModel.deleteMany({ email, type: 'developer_registration' });
    await otpModel.create({ email, otp, type: 'developer_registration' });

    await sendEmail({
      to: email,
      subject: "JSS Connect — Developer Verification",
      text: `Your Developer Registration Verification Code is: ${otp}\nCode expires in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; text-align: center;">
          <h2 style="color: #0052cc;">Developer Authentication Request</h2>
          <p>We received a request to register a biometric device to your Developer account.</p>
          <div style="font-size: 32px; font-weight: bold; background: #f0f4f8; padding: 20px; display: inline-block; border-radius: 8px; color: #0D9B8A; letter-spacing: 5px;">${otp}</div>
          <p style="margin-top: 20px; font-size: 14px; color: #888;">If you did not initiate this registration, please secure your Master credentials immediately.</p>
        </div>
      `
    });

    res.json({ message: "Verification OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
};

export const generateRegistration = async (req, res) => {
  const { email, devId, devPassword, otp } = req.body;
  if (!email || !devId || !devPassword || !otp) {
    return res.status(400).json({ error: "Email, Developer ID, Password, and OTP required" });
  }

  const masterId = process.env.MASTER_DEV_ID || "supreme_admin";
  const masterPassword = process.env.MASTER_DEV_PASSWORD || "jss_secure_pass_2026";

  if (devId !== masterId || devPassword !== masterPassword) {
    return res.status(403).json({ error: "Invalid master credentials. Registration blocked." });
  }

  try {
    const storedOtpDoc = await otpModel.findOne({ email, type: 'developer_registration' });
    if (!storedOtpDoc || storedOtpDoc.otp !== otp) {
      return res.status(401).json({ error: "Invalid or expired Verification Code." });
    }

    const user = await getOrCreateDeveloper(email);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Uint8Array.from(Buffer.from(user._id.toString(), "utf8")),
      userName: user.email,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform", // forces use of device biometrics
      },
      excludeCredentials: user.passkeys.map((passkey) => ({
        id: Uint8Array.from(Buffer.from(passkey.credentialID, 'base64url')),
        type: "public-key",
      })),
    });

    user.currentChallenge = options.challenge;
    await user.save();
    
    // Clear OTP after successful challenge generation sequence starts
    await otpModel.deleteMany({ email, type: 'developer_registration' });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to generate registration options" });
  }
};

export const verifyRegistration = async (req, res) => {
  const { email, data } = req.body;
  console.log("--> verifyRegistration called for email:", email);
  
  try {
    const user = await developerModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "Developer not found" });

    const expectedChallenge = user.currentChallenge;

    let verification;
    try {
      console.log("--> Calling verifyRegistrationResponse...");
      verification = await verifyRegistrationResponse({
        response: data,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
      console.log("--> verification result:", verification.verified);
    } catch (error) {
      console.error("--> WebAuthn Verification Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      // Compatibility for v10+ where parameters moved into `credential`
      const credential = registrationInfo.credential || registrationInfo;
      const credID = credential.id || credential.credentialID;
      const credPubKey = credential.publicKey || credential.credentialPublicKey;

      const newPasskey = {
        // If it's a string, keep it. If it's a Uint8Array buffer, convert it.
        credentialID: typeof credID === 'string' ? credID : Buffer.from(credID).toString('base64url'),
        credentialPublicKey: Buffer.from(credPubKey).toString('base64url'),
        counter: credential.counter,
        transports: credential.transports || data.response.transports || [],
      };

      user.passkeys.push(newPasskey);
      user.markModified('passkeys');
      user.currentChallenge = null;
      await user.save();

      return res.json({ verified: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify registration" });
  }
};

export const generateAuth = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await developerModel.findOne({ email });
    if (!user || user.passkeys.length === 0) {
      return res.status(400).json({ error: "User is not registered or has no passkeys" });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.passkeys.map((passkey) => ({
        id: passkey.credentialID,
        type: "public-key",
        transports: passkey.transports,
      })),
      userVerification: "preferred",
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (error) {
    console.error("--> generateAuth Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate auth options" });
  }
};

export const verifyAuth = async (req, res) => {
  const { email, data } = req.body;
  
  try {
    const user = await developerModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "Developer not found" });

    const expectedChallenge = user.currentChallenge;
    const passkey = user.passkeys.find(pk => pk.credentialID === data.id);

    if (!passkey) {
      return res.status(400).json({ error: "Passkey not found" });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: data,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credentialID,
          publicKey: Uint8Array.from(Buffer.from(passkey.credentialPublicKey, 'base64url')),
          counter: passkey.counter,
        },
      });
    } catch (error) {
      console.error("--> WebAuthn Auth Verification Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update the counter to strictly prevent cryptographic replay attacks
      passkey.counter = authenticationInfo.newCounter;
      user.markModified('passkeys');
      user.currentChallenge = null;
      await user.save();

      // Issue the Supreme Developer Context Token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: "supreme_developer", // Supreme Power Level Access
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Lock it securely into an HTTP-Only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({ verified: true, message: "Supreme Power Context established." });
    } else {
      return res.status(401).json({ error: "Cryptographic signature validation failed. Access Denied." });
    }
  } catch (error) {
    console.error("--> verifyAuth Error:", error.message);
    res.status(500).json({ error: "Failed to verify authentication" });
  }
};

export const validateFacultyRegister = async (req, res) => {
  if (req.user && req.user.role === 'supreme_developer') {
    return res.json({ valid: true });
  }
  return res.status(403).json({ error: "Access Denied. Supreme Developer authorization required." });
};

export const facultyRegister = async (req, res) => {
  const { email, data, newFacultyData } = req.body;
  if (!email || !data || !newFacultyData) {
     return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const user = await developerModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "Developer not found" });

    const expectedChallenge = user.currentChallenge;
    const passkey = user.passkeys.find(pk => pk.credentialID === data.id);

    if (!passkey) {
      return res.status(400).json({ error: "Passkey not found" });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: data,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credentialID,
          publicKey: Uint8Array.from(Buffer.from(passkey.credentialPublicKey, 'base64url')),
          counter: passkey.counter,
        },
      });
    } catch (error) {
      console.error("--> WebAuthn Auth Verification Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      passkey.counter = authenticationInfo.newCounter;
      user.markModified('passkeys');
      user.currentChallenge = null;
      await user.save();

      // Developer is verified via biometrics, proceed to create the faculty/admin user
      const { role, fullname, newEmail, contact, password } = newFacultyData;

      const existingUser = await userModel.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await userModel.create({
        username: fullname,
        email: newEmail,
        password: hashedPassword,
        contact: contact,
        role: role,
        verified: true // Verified because developer is creating them
      });

      return res.json({ success: true, message: `${role} account created successfully.` });
    } else {
      return res.status(401).json({ error: "Cryptographic signature validation failed. Access Denied." });
    }
  } catch (error) {
    console.error("--> facultyRegister Error:", error.message);
    res.status(500).json({ error: "Failed to register staff" });
  }
};

