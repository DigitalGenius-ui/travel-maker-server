import { z } from "zod";

export const userMomentSchema = z.object({
  title: z.string(),
  desc: z.string(),
  location: z.string(),
  postImages: z.array(z.string()),
});

export const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "EDITOR"]),
  verified: z.enum(["VERIFIED", "UNVERIFIED", "BLOCKED"]),
  userId: z.string().min(1).max(26),
});

export const momentCommentShcema = z.object({
  comment: z.string(),
  momentId: z.string().min(1).max(26),
});

export const passwordShcema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});
