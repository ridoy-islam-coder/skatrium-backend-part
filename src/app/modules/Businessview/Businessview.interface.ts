import { Document, Types } from 'mongoose';

// ═══════════════════════════════════════════════════════════════════
//  BusinessView Interface
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessView extends Document {
  business:  Types.ObjectId;   // ref: 'Business'
  viewer:    Types.ObjectId;   // ref: 'User'
  viewedAt:  Date;
  year:      number;
  month:     number;           // 1–12
}