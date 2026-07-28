import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { applyToJSONTransform } from '../../common/mongoose/apply-to-json-transform';

@Schema({ collection: 'todos', timestamps: true })
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: false })
  inMyDay: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;
}

export type TodoDocument = HydratedDocument<Todo>;

export const TodoSchema = SchemaFactory.createForClass(Todo);
TodoSchema.index({ userId: 1 });
TodoSchema.index({ categoryId: 1 });
TodoSchema.index({ userId: 1, inMyDay: 1 });
applyToJSONTransform(TodoSchema);
