import express from "express";
import { getWelcome } from "./profile.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get('/:userId/welcome', authenticate, getWelcome);
export default router;




















