import { authService } from "./auth.service.js";

async function signup(req, res) {
  try {
    const userData = req.body;

    const result = await authService.signup(userData);

    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
}

async function login(req, res) {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    const result = await authService.login(identifier, password);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
}

async function logout(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await authService.logout(token);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
}

export { signup, login, logout };
