import { Router } from "express";
import { authValidator } from "../../middlewares/validators/index.js"

// controller imports
import { getUser, updateProfile, logout, updateResume } from "../../controllers/user.controller.js"

// middlewares
import { jobseeker, upload } from "../../middlewares/index.js";


const router = Router();

router.route("/").get(jobseeker, getUser);
router.route("/logout").get(jobseeker, logout);

router.route("/update-profile").post( upload.fields([ {name: "profilePhoto", maxCount: 1}]), authValidator.updateProfile, jobseeker, updateProfile);
router.route("/update-resume").post( upload.fields([ {name: "resume", maxCount: 1}]), jobseeker, updateResume);




export default router;