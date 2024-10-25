import { Router } from "express";

// controller imports
import {registerCompany, getAllCompany, getCompanyById, updateCompany} from "../../controllers/company.controller.js"

// middlewares
import { recruiter, upload, } from "../../middlewares/index.js";
import { companyValidator } from "../../middlewares/validators/index.js"

const router = Router();

router.route("/register").post(upload.fields([ {name: "logo", maxCount: 1}]),companyValidator.register, recruiter, registerCompany);
router.route("/").get(recruiter, getAllCompany);
router.route("/id=:companyId").get(recruiter, getCompanyById);
router.route("/update/id=:companyId").post(upload.fields([ {name: "logo", maxCount: 1}]), recruiter, updateCompany);

export default router;

