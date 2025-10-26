import { Router } from "express";
import { loginUser, logoutusre, Rgisteruser } from "../controllers/authcontroller.js";
import { validation, loginvalidation } from "../middlewares/validator.middleware.js";
import { authvalidation } from "../middlewares/auth.midddleware.js";
const router = Router();

router.route("/register").post( validation, Rgisteruser);
router.route("/login").post(loginvalidation, loginUser)
router.route("/logout").post(authvalidation, logoutusre)
export default router;
