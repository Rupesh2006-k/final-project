import express from 'express';
import { signup, login } from './auth.controller.js';
import {signupSchema,loginSchema} from './auth.validation.js';
import { validate } from '../../common/middleware/auth.validate.js';


const router = express.Router();

router.post('/signup',validate(signupSchema),signup);
router.post('/login',validate(loginSchema), login);

export default router;