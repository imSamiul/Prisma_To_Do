import { z } from 'zod';

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
