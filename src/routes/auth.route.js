import { Router } from "express";
import { authValidator } from "../middlewares/validators/index.js"

// controller imports
import { register, login } from "../controllers/user.controller.js"


const router = Router();

// public routes
router.route("/register").post(authValidator.register, register);
router.route("/login").post(authValidator.login, login);


export default router;