import { z } from "zod";

export const loginSchema = z.object({
   email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Format email tidak valid"),

   password: z
      .string()
      .min(8, "Password minimal 8 karakter"),
});

export type LoginSchema = z.infer<typeof loginSchema>;