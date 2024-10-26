import { Router } from "express";

import { getCategories, createCategory } from "../../controllers/admin/settings.controller.js";


// middleware imports
import settingValidator from "../../middlewares/validators/admin/settting.validator.js"

const router = Router();

// we will add admin middleware later 
router.route("/categories").get( getCategories);
router.route("/create-category").post(settingValidator.createCategory, createCategory);

export default router;