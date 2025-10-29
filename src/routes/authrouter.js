import { Router } from "express";
import { changeCurrentPaswword, forgotpasswordRequest, getcurrentuser, loginUser, logoutusre, newrfereshtoken, resendemailverification, Resetpassword, Rgisteruser, verifyemail } from "../controllers/authcontroller.js";
import { validation, loginvalidation } from "../middlewares/validator.middleware.js";
import { authvalidation } from "../middlewares/auth.midddleware.js";
const router = Router();

router.route("/register").post( validation, Rgisteruser);
router.route("/login").post(loginvalidation, loginUser)
router.route("/logout").post(authvalidation, logoutusre)
router.route("/verify-email/:verificationtoken").get(verifyemail)
router.route("/refresh-token").get(newrfereshtoken)
router.route("/forgot-password").post(forgotpasswordRequest)
router.route("/reset-password/:resettoken").post(Resetpassword)
router.route("/change-current-password").post(authvalidation, changeCurrentPaswword)
router.route("/resend-email").get(authvalidation, resendemailverification);
router.route("/current-user").get(authvalidation, getcurrentuser)
export default router;
