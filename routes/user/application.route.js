import { Router } from "express";

// controller imports
import { applyJob, allAppliedJobs } from "../../controllers/application.controller.js"


// middlewares
import { jobseeker } from "../../middlewares/index.js";


const router = Router();

router.route("/apply-job/id=:jobId").get( jobseeker, applyJob);
router.route("/").get( jobseeker, allAppliedJobs);




export default router;