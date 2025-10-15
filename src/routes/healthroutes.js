import { Router } from "express";
import { healthController } from "../controllers/healthController.js";

const router = Router()

router.route("/healthcheck").get(healthController)

export default router