import { z } from 'zod';
import { objectIdSchema } from '../../common/validation/object-id.schema';

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  categoryId: objectIdSchema,
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
