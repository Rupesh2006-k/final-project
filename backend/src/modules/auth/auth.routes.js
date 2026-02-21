import express from "express";
import { signup, login, logout } from "./auth.controller.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import { validate } from "../../common/middleware/auth.validate.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);

export default router;
