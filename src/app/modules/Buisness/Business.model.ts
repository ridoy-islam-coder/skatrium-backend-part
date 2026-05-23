import mongoose, { Model, Schema } from 'mongoose';
import {
  BusinessType,
  IBusinessDocument,
  IReview,
  SpotlightNature,
} from './Business.interface';

// ═══════════════════════════════════════════════════════════════════
//  Model Interface
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessModel extends Model<IBusinessDocument> {}

// ═══════════════════════════════════════════════════════════════════
//  Reply Schema
// ═══════════════════════════════════════════════════════════════════
const replySchema = new Schema(
  {
    user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true, trim: true },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ═══════════════════════════════════════════════════════════════════
//  Review Schema
// ═══════════════════════════════════════════════════════════════════
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [
      {
        id:  { type: String, default: '' },
        url: { type: String, default: '' },
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ═══════════════════════════════════════════════════════════════════
//  Business Schema
// ═══════════════════════════════════════════════════════════════════
const businessSchema = new Schema<IBusinessDocument, IBusinessModel>(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business owner is required'],
    },
    business_name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    business_type: {
      type: String,
      enum: Object.values(BusinessType),
      default: BusinessType.OFFLINE,
    },
    business_category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Business category is required'],
    },
    business_sub_category: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Business sub-category is required'],
    },

    // ── Geo Location ─────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },

    get_velocity_option: {
      type: String,
      enum: Object.values(SpotlightNature),
      default: SpotlightNature.SPOTLIGHT_NATURE,
    },

    // ── Images ───────────────────────────────────────────────────
    featured_image:       { type: String, default: '' },
    featured_image_key:   { type: String, default: '' },   // ✅ S3 key
    business_description: { type: String, default: '' },
    gallery:              [{ type: String }],
    gallery_keys:         [{ type: String }],              // ✅ S3 keys

    // ── Reviews ──────────────────────────────────────────────────
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// ═══════════════════════════════════════════════════════════════════
//  Indexes
// ═══════════════════════════════════════════════════════════════════
businessSchema.index({ host: 1 });
businessSchema.index({ business_category: 1, business_sub_category: 1 });
businessSchema.index({ location: '2dsphere' });

// ═══════════════════════════════════════════════════════════════════
//  Model
// ═══════════════════════════════════════════════════════════════════
const Business = mongoose.model<IBusinessDocument, IBusinessModel>(
  'Business',
  businessSchema
);

export default Business;