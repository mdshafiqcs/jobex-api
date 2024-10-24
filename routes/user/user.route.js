import { Router } from "express";

// controller imports

// middlewares
import { jobseeker } from "../../middlewares/index.js";


const router = Router();

router.route("/").get(jobseeker, getUser);
router.route("/logout").get(jobseeker, logout);



export default router;