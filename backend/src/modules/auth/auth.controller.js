import { authService } from './auth.service.js';

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 100
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             phone: "9876543210"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Validation error or email/phone already registered
 */
async function signup(req, res) {
  try {
    const userData = req.body;

    const result = await authService.signup(userData);

    return res.status(201).json({
      success: true,
      message: 'User signed up successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Signup failed'
    });
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Login with email or phone number and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (optional if phone is provided)
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Phone number (optional if email is provided)
 *               password:
 *                 type: string
 *                 minLength: 1
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid credentials or validation error
 */
async function login(req, res) {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    const result = await authService.login(identifier, password);

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
}

export { signup, login };
