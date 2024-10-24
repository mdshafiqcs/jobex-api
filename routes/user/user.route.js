import { Router } from "express";
import { authValidator } from "../../middlewares/validators/index.js"

// controller imports
import { getUser, updateProfile, logout } from "../../controllers/user.controller.js"

// middlewares
import { jobseeker, upload } from "../../middlewares/index.js";


const router = Router();

router.route("/").get(jobseeker, getUser);
router.route("/logout").get(jobseeker, logout);

router.route("/update-profile").post( upload.fields([ {name: "profilePhoto", maxCount: 1}]), authValidator.updateProfile, jobseeker, updateProfile);




export default router;