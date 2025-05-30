import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1),
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
