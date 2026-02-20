import { z } from "zod";
export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .trim(),

    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format")
      .trim(),

    phone: z
      .string({
        required_error: "Phone number is required",
      })
      .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
      .trim(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password too long"),
  }),
});
export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .trim()
        .optional()
        .or(z.literal("")),

      phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .trim()
        .optional()
        .or(z.literal("")), 

      password: z
        .string({
          required_error: "Password is required",
        })
        .min(1, "Password is required"),
    })
    .refine(
      (data) => {
        const hasEmail = data.email && data.email.trim().length > 0;
        const hasPhone = data.phone && data.phone.trim().length > 0;
        return hasEmail || hasPhone;
      },
      {
        message: "Either email or phone number is required",
        path: ["email"], 
      },
    ),
});
