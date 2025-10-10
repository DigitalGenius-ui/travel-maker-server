import { z } from "zod";

export const filterSchema = z.enum(["weekly", "monthly", "yearly"]);
