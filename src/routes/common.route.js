import { Router } from "express";

const router = Router();

// controller imports
import { getLocations, getCategories } from "../controllers/common.controller.js";

router.route("/locations").get(getLocations);
router.route("/categories").get(getCategories);

export default router;


