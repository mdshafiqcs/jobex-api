import { Router } from "express";

// controller imports
import { postJob, getJobById, getRecruiterJobs } from "../../controllers/job.controller.js"



// middlewares
import { recruiter } from "../../middlewares/index.js";
import { jobValidator } from "../../middlewares/validators/index.js"



const router = Router();

router.route("/post-job").post(jobValidator.postJob, recruiter, postJob);
router.route("/").get(recruiter, getRecruiterJobs);
router.route("/id=:jobId").get(recruiter, getJobById);

export default router;