import express from "express";
import { loginUser, registerUser, verifyOTP, logoutUser} from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/register", uploadFile, registerUser);
router.post("/verify", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", logoutUser)
export default router;
