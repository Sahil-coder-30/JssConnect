import UserprofileModel from "../models/Userprofile.model.js";
import { uploadImage } from "../services/storage.service.js";

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export const createStudentProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const {
      name,
      bio,
      about,
      year,
      branch,
      location,
      backCoverImage,
      socialLinks,
      education,
      skills,
    } = req.body;

    // Handle file uploads
    let profileImageUrl = null;
    let coverImageUrl = null;

    if (req.files?.profileImage && req.files.profileImage[0]) {
      const file = req.files.profileImage[0];
      profileImageUrl = await uploadImage("profiles", file.buffer, `profile_${userId}_${Date.now()}.jpg`);
    }

    if (req.files?.coverImage && req.files.coverImage[0]) {
      const file = req.files.coverImage[0];
      coverImageUrl = await uploadImage("covers", file.buffer, `cover_${userId}_${Date.now()}.jpg`);
    }

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Name is required and must be at least 3 characters." });
    }

    const profileData = {
      user: userId,
      name: name.trim(),
      bio: bio ? String(bio).trim() : null,
      about: about ? String(about).trim() : null,
      year: year ? String(year).trim() : null,
      branch: branch ? String(branch).trim() : null,
      location: location ? String(location).trim() : null,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
      backCoverImage: backCoverImage ? String(backCoverImage).trim() : null,
      socialLinks: normalizeArray(socialLinks).map((link) => ({
        platform: String(link.platform || "").trim(),
        url: String(link.url || "").trim(),
      })).filter((link) => link.platform && link.url),
      education: normalizeArray(education).map((item) => ({
        institution: String(item.institution || "").trim(),
        degree: String(item.degree || "").trim(),
        startYear: item.startYear ? Number(item.startYear) : null,
        endYear: item.endYear ? Number(item.endYear) : null,
      })).filter((item) => item.institution && item.degree && item.startYear),
      skills: normalizeArray(skills).map((skill) => String(skill).trim()).filter(Boolean),
    };

    const existingProfile = await UserprofileModel.findOne({ user: userId });

    let profile;
    if (existingProfile) {
      Object.assign(existingProfile, profileData);
      profile = await existingProfile.save();
      return res.status(200).json({ message: "Profile updated successfully.", profile });
    }

    profile = await UserprofileModel.create(profileData);
    return res.status(201).json({ message: "Profile created successfully.", profile });
  } catch (error) {
    console.error("createStudentProfile error:", error);
    return res.status(500).json({ message: "Failed to create profile.", error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const profile = await UserprofileModel.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

export const getStudentProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Profile userId is required." });
    }

    const profile = await UserprofileModel.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getStudentProfileById error:", error);
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};
