import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(1).max(12),
  userAgent: z.string().optional(),
});

export const registerSchemas = loginSchema
  .extend({
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!!",
    path: ["confirmPasword"],
  });

export const idSchema = z.string().min(1).max(26);
export const emailSchema = z.string().email().min(1);
export const resetPasswordValidSchemas = z.object({
  verificationCode: z.string().min(1).max(26),
  password: z.string().min(1).max(12),
});
