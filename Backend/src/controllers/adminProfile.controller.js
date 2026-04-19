import AdminprofileModel from "../models/AdminProfile.model.js";
import { uploadImage } from "../services/storage.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Create or Update Admin Profile
// POST /api/admin/profile
// Protected: admin or supreme_developer role
// ─────────────────────────────────────────────────────────────────────────────
export const createAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { designation, about, backCoverImage, alternateText } = req.body;

    // Validate required fields
    if (!designation || typeof designation !== "string" || designation.trim().length < 2) {
      return res.status(400).json({ message: "Designation is required (min 2 characters)." });
    }
    if (!about || typeof about !== "string" || about.trim().length < 3) {
      return res.status(400).json({ message: "About is required (min 3 characters)." });
    }

    // Handle profile photo upload
    let profileImageUrl = null;
    if (req.files?.profileImage && req.files.profileImage[0]) {
      const file = req.files.profileImage[0];
      profileImageUrl = await uploadImage(
        "admin-profiles",
        file.buffer,
        `admin_${userId}_${Date.now()}.jpg`
      );
    }

    const profileData = {
      Admin: userId,
      profilePhoto: {
        Image: profileImageUrl,
        alternate: alternateText ? String(alternateText).trim() : null,
      },
      Designation: designation.trim(),
      About: about.trim(),
      backCoverImage: backCoverImage ? String(backCoverImage).trim() : null,
    };

    const existingProfile = await AdminprofileModel.findOne({ Admin: userId });

    let profile;
    if (existingProfile) {
      Object.assign(existingProfile, profileData);
      profile = await existingProfile.save();
      return res.status(200).json({ message: "Admin profile updated successfully.", profile });
    }

    profile = await AdminprofileModel.create(profileData);
    return res.status(201).json({ message: "Admin profile created successfully.", profile });
  } catch (error) {
    console.error("createAdminProfile error:", error);
    return res.status(500).json({ message: "Failed to save admin profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get My (Admin's own) Profile
// GET /api/admin/profile/me
// Protected: admin role
// ─────────────────────────────────────────────────────────────────────────────
export const getMyAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const profile = await AdminprofileModel.findOne({ Admin: userId });
    if (!profile) {
      return res.status(404).json({ message: "Admin profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getMyAdminProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch admin profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Admin Profile by User ID
// GET /api/admin/profile/:userId
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const profile = await AdminprofileModel.findOne({ Admin: userId });
    if (!profile) {
      return res.status(404).json({ message: "Admin profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getAdminProfileById error:", error);
    return res.status(500).json({ message: "Failed to fetch admin profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Block a User (Admin-only action stored on admin profile)
// POST /api/admin/block
// Protected: admin role
// ─────────────────────────────────────────────────────────────────────────────
export const blockUser = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Target userId is required." });
    }
    if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
      return res.status(400).json({ message: "A reason for blocking is required (min 3 characters)." });
    }

    const adminProfile = await AdminprofileModel.findOne({ Admin: adminId });
    if (!adminProfile) {
      return res
        .status(404)
        .json({ message: "Admin profile not found. Please create your profile first." });
    }

    // Prevent duplicate block entries for same user
    const alreadyBlocked = adminProfile.BlockerUser?.userId?.toString() === userId;
    if (alreadyBlocked) {
      return res.status(400).json({ message: "User is already blocked." });
    }

    adminProfile.BlockerUser = { userId, reason: reason.trim() };
    await adminProfile.save();

    return res.status(200).json({ message: "User blocked successfully.", adminProfile });
  } catch (error) {
    console.error("blockUser error:", error);
    return res.status(500).json({ message: "Failed to block user.", error: error.message });
  }
};
