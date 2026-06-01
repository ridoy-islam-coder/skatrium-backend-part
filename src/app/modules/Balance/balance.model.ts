import { Schema, model, Document, Types } from 'mongoose';

export interface IDriverProfile extends Document {
  _id: Types.ObjectId;
  userId: string;
  currentBalance: number;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const balanceSchema = new Schema<IDriverProfile>(
  {
    userId: { type: String, ref: 'User', required: true },
    currentBalance: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: null },
    stripeOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const BalanceModel = model<IDriverProfile>('Balance', balanceSchema);