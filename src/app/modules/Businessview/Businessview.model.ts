import mongoose, { Schema } from 'mongoose';
import { IBusinessView } from './Businessview.interface';



const businessViewSchema = new Schema<IBusinessView>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    viewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
  },
  { timestamps: false }
);

// ── Indexes ───────────────────────────────────────────────────────
businessViewSchema.index({ business: 1, year: 1, month: 1 });
businessViewSchema.index({ viewer: 1 });

// ═══════════════════════════════════════════════════════════════════
//  Model
// ═══════════════════════════════════════════════════════════════════
const BusinessView = mongoose.model<IBusinessView>(
  'BusinessView',
  businessViewSchema
);

export default BusinessView;