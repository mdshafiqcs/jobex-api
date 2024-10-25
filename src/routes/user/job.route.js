import { Router } from "express";

// controller imports
import { getAllJobs, getJobById } from "../../controllers/job.controller.js"


const router = Router();

router.route("/").get(getAllJobs);
router.route("/id=:jobId").get(getJobById);



export default router;