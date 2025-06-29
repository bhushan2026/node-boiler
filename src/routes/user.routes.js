import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile, 
    updateUserProfile, 
    changePassword 
} from "../controllers/user.controllers.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(jwtVerify, logoutUser);
router.route("/profile").get(jwtVerify, getUserProfile);

router.route("/profile/update").patch(jwtVerify, updateUserProfile);
router.route("/change-password").post(jwtVerify, changePassword);

export default router;