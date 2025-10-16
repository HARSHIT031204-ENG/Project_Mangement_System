import { Router } from "express";
import { Rgisteruser } from "../controllers/authcontroller.js"
const router = Router()

router.route("/register").post(Rgisteruser)

export default router