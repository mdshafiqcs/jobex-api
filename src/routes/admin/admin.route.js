import { Router } from "express";

// middleware imports

const router = Router();

// we will add admin middleware later 
import settingsRouter from "./settings.route.js"

router.use("/settings", settingsRouter);

export default router;