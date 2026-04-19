import AluminiprofileModel from "../models/AluminiProfile.model.js";
import { uploadImage } from "../services/storage.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Create or Update Alumni Profile
// POST /api/alumni/profile
// Protected: alumni role
// ─────────────────────────────────────────────────────────────────────────────
export const createAlumniProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { company, about, backCoverImage, alternateText } = req.body;

    // Validate required fields
    if (!company || typeof company !== "string" || company.trim().length < 2) {
      return res.status(400).json({ message: "Company name is required (min 2 characters)." });
    }
    if (!about || typeof about !== "string" || about.trim().length < 3) {
      return res.status(400).json({ message: "About section is required (min 3 characters)." });
    }

    // Handle profile photo upload
    let profileImageUrl = null;
    if (req.files?.profileImage && req.files.profileImage[0]) {
      const file = req.files.profileImage[0];
      profileImageUrl = await uploadImage(
        "alumni-profiles",
        file.buffer,
        `alumni_${userId}_${Date.now()}.jpg`
      );
    }

    const profileData = {
      Alumini: userId,
      profilePhoto: {
        Image: profileImageUrl,
        alternate: alternateText ? String(alternateText).trim() : null,
      },
      Company: company.trim(),
      About: about.trim(),
      backCoverImage: backCoverImage ? String(backCoverImage).trim() : null,
    };

    const existingProfile = await AluminiprofileModel.findOne({ Alumini: userId });

    let profile;
    if (existingProfile) {
      Object.assign(existingProfile, profileData);
      profile = await existingProfile.save();
      return res.status(200).json({ message: "Alumni profile updated successfully.", profile });
    }

    profile = await AluminiprofileModel.create(profileData);
    return res.status(201).json({ message: "Alumni profile created successfully.", profile });
  } catch (error) {
    console.error("createAlumniProfile error:", error);
    return res.status(500).json({ message: "Failed to save alumni profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get My (Alumni's own) Profile
// GET /api/alumni/profile/me
// Protected: alumni role
// ─────────────────────────────────────────────────────────────────────────────
export const getMyAlumniProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const profile = await AluminiprofileModel.findOne({ Alumini: userId });
    if (!profile) {
      return res.status(404).json({ message: "Alumni profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getMyAlumniProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch alumni profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Alumni Profile by User ID (other users / admin viewing)
// GET /api/alumni/profile/:userId
// ─────────────────────────────────────────────────────────────────────────────
export const getAlumniProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const profile = await AluminiprofileModel.findOne({ Alumini: userId });
    if (!profile) {
      return res.status(404).json({ message: "Alumni profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getAlumniProfileById error:", error);
    return res.status(500).json({ message: "Failed to fetch alumni profile.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get All Alumni Profiles (paginated, with optional company search)
// GET /api/alumni/all?page=1&limit=20&company=Google
// ─────────────────────────────────────────────────────────────────────────────
export const getAllAlumniProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, company } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (company) {
      // Case-insensitive partial match on company name
      filter.Company = { $regex: company, $options: "i" };
    }

    const [profiles, total] = await Promise.all([
      AluminiprofileModel.find(filter)
        .populate("Alumini", "username email")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      AluminiprofileModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      profiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getAllAlumniProfiles error:", error);
    return res.status(500).json({ message: "Failed to fetch alumni profiles.", error: error.message });
  }
};
