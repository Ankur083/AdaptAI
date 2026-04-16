import { Router } from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, forgotPassword, resetPassword } from '../controllers/userController.js';
import { saveQuizProgress, getUserProgressHistory } from '../controllers/userProgressController.js';
import { createUserCourse, getUserCourses, getUserCourseById } from '../controllers/userCourseController.js';
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/profile").get(verifyJWT, getCurrentUser);
router.route("/update").put(verifyJWT, updateAccountDetails);
router.route("/update/avatar").put(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/courses").post(verifyJWT, createUserCourse).get(verifyJWT, getUserCourses);
router.route("/courses/:id").get(verifyJWT, getUserCourseById);
router.route("/progress").post(verifyJWT, saveQuizProgress).get(verifyJWT, getUserProgressHistory);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;