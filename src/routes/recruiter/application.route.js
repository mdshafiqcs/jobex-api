import { Router } from "express";

// controller imports
import { allApplicationsByJobId, updateStatus, getApplicationById } from "../../controllers/application.controller.js"


// middlewares
import { recruiter } from "../../middlewares/index.js";

const router = Router();


router.route("/id=:applicationId").get( recruiter, getApplicationById);
router.route("/jobId=:jobId").get( recruiter, allApplicationsByJobId);
router.route("/update").patch( recruiter, updateStatus);



export default router;