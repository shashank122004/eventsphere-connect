import express from "express";
import { login, signup, verifyEmailCode, resendOtp, forgotPassword, resetPassword} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verify-email", verifyEmailCode);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);
export default router;
