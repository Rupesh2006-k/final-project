/**
 * @swagger
 * /api/profile/{userId}/welcome:
 *   get:
 *     summary: Get welcome message for user profile
 *     description: Returns personalized welcome message for the authenticated user
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Welcome message retrieved successfully
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
 *                     userId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     welcomeMessage:
 *                       type: string
 *       401:
 *         description: Unauthorized - No token or invalid token
 *       403:
 *         description: Forbidden - Cannot access another user's profile
 *       500:
 *         description: Server error
 */
export async function getWelcome(req, res) {
  try {
    const { userId } = req.params;
    const authenticatedUser = req.user;

    if (authenticatedUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own profile",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome ${authenticatedUser.name}!`,
      data: {
        userId: authenticatedUser._id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        welcomeMessage: `Hello ${authenticatedUser.name}, welcome to Uber Clone!`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get welcome message",
    });
  }
}
