import { Types } from 'mongoose';

/** Match documents whether the id was stored as ObjectId or plain string. */
export function idIn(id: string): { $in: Array<Types.ObjectId | string> } {
  return { $in: [new Types.ObjectId(id), id] };
}
