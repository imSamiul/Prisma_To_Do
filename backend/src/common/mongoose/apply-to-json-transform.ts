import { Schema } from 'mongoose';

/**
 * Makes documents serialize with `id` (string) instead of `_id`/`__v`,
 * matching the previous Prisma-based API response shape.
 */
export function applyToJSONTransform(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  });
}
