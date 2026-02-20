import { User } from "../model/user.model.js";

class AuthService {
  async signup(userData) {
    try {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }],
      });
      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error("Email already registered");
        }
        if (existingUser.phone === userData.phone) {
          throw new Error("Phone number already registered");
        }
      }

      const user = await User.create(userData);
      const token = user.generateAuthToken();

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(identifier, password) {
    try {
      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      }).select("+password");

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error("Invalid credentials password invalid");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated. Please contact support.");
      }

      const token = user.generateAuthToken();

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
