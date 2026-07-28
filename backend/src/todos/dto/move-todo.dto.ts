import { z } from 'zod';
import { objectIdSchema } from '../../common/validation/object-id.schema';

export const moveTodoSchema = z.object({
  categoryId: objectIdSchema,
});

export type MoveTodoDto = z.infer<typeof moveTodoSchema>;
