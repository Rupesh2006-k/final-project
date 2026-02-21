import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  updateStatus,
  getProfileCompletion,
} from "./driver.controller.js";
import {
  authenticate,
  authorizeRole,
} from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/auth.validate.js";
import {
  createDriverProfileSchema,
  updateDriverProfileSchema,
  updateStatusSchema,
} from "./driver.validation.js";
const router = express.Router();


router.post(
  "/register",
  authenticate,
  validate(createDriverProfileSchema),
  createProfile,
);


router.get(
  "/me/completion",
  authenticate,
  authorizeRole("DRIVER"),
  getProfileCompletion,
);

router.patch(
  "/me/status",
  authenticate,
  authorizeRole("DRIVER"),
  validate(updateStatusSchema),
  updateStatus,
);

router.get("/me", authenticate, authorizeRole("DRIVER"), getProfile);

router.patch(
  "/me",
  authenticate,
  authorizeRole("DRIVER"),
  validate(updateDriverProfileSchema),
  updateProfile,
);

export default router;
