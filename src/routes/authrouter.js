import { Router } from "express";
import { loginUser, Rgisteruser } from "../controllers/authcontroller.js";
import { validation } from "../middlewares/validator.middleware.js";
const router = Router();

router.route("/register").post( validation, Rgisteruser);
router.route("/login").get(loginUser)
export default router;
