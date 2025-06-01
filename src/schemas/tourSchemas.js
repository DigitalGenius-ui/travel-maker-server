import { z } from "zod";

export const createTourSchema = z.object({
  text: z.string(),
  rating: z.string(),
  reviewImages: z.string(),
  toursId: z.string().min(1).max(26),
});
