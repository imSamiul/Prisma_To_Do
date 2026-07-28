import { z } from 'zod';

export const setMyDaySchema = z.object({
  inMyDay: z.boolean(),
});

export type SetMyDayDto = z.infer<typeof setMyDaySchema>;
