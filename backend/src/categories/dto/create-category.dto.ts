import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
