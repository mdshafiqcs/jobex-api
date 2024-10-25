import { Router } from "express";

// controller imports
import { allApplications, updateStatus } from "../../controllers/application.controller.js"


// middlewares
import { recruiter } from "../../middlewares/index.js";

const router = Router();

router.route("/jobId=:jobId").get( recruiter, allApplications);
router.route("/update").patch( recruiter, updateStatus);



export default router;