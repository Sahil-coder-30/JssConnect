import { Router } from "express";
import {
  verifyMaster,
  sendDeveloperOtp,
  generateRegistration,
  verifyRegistration,
  generateAuth,
  verifyAuth,
  validateFacultyRegister,
  facultyRegister
} from "../controllers/developer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/verify-master", verifyMaster);
router.post("/send-otp", sendDeveloperOtp);
router.post("/generate-registration", generateRegistration);
router.post("/verify-registration", verifyRegistration);
router.get("/generate-auth", generateAuth);
router.post("/verify-auth", verifyAuth);
router.get("/validate-faculty-register", authMiddleware, validateFacultyRegister);
router.post("/faculty-register", facultyRegister);

export default router;
