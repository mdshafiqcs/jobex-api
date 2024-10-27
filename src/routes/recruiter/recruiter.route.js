import { Router } from "express";
import { authValidator } from "../../middlewares/validators/index.js"

// controller imports
import { getUser, updateProfile, logout } from "../../controllers/user.controller.js"


// middlewares
import { recruiter, upload } from "../../middlewares/index.js";



const router = Router();


router.route("/").get(recruiter, getUser);
router.route("/logout").get(recruiter, logout);

router.route("/update-profile").post( upload.fields([ {name: "profilePhoto", maxCount: 1}]), authValidator.updateProfile, recruiter, updateProfile);



// router imports
import companyRouter from "./company.route.js"
import jobRouter from "./job.route.js"
import applicationRouter from "./application.route.js"
import commonRouter from "../common.route.js"


router.use("/company", companyRouter);
router.use("/job", jobRouter);
router.use("/application", applicationRouter);
router.use("/common", commonRouter);


export default router;