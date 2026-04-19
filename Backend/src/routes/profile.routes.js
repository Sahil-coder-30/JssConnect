import { Router } from "express";
import {
  createStudentProfile,
  getMyProfile,
  getStudentProfileById,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import multer from 'multer';
const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 5 * 1024 * 1024, // 5MB limit
    }
})
const router = Router();

router.post("/", authMiddleware, upload.fields([{ name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
]), createStudentProfile);
router.get("/me", authMiddleware, getMyProfile);
router.get("/:userId", authMiddleware, getStudentProfileById);

export default router;
