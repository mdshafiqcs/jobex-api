import { Router } from "express";

// controller imports
import { getAllJobs, getJobById, searchJobs } from "../../controllers/job.controller.js"


const router = Router();

router.route("/").get(getAllJobs);
router.route("/search").get(searchJobs);
router.route("/id=:jobId").get(getJobById);



export default router;