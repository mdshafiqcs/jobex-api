import { Router } from "express";

import { 
  getCategories, 
  createCategory, 
  getLocations, 
  createLocation, 
  
} from "../../controllers/admin/settings.controller.js";


// middleware imports
import settingValidator from "../../middlewares/validators/admin/settting.validator.js"

const router = Router();

// we will add admin middleware later 
router.route("/categories").get(getCategories);
router.route("/create-category").post(settingValidator.createCategory, createCategory);

router.route("/locations").get(getLocations);
router.route("/create-location").post(settingValidator.createLocation, createLocation);

export default router;