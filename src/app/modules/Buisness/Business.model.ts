import mongoose, { Document, Model, Schema } from 'mongoose';
import { BusinessType,  IBusinessDocument,  IReview, SpotlightNature } from './Business.interface';



// ═══════════════════════════════════════════════════════════════════
//  Model Interface
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessModel extends Model<IBusinessDocument> {}




const replySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true, trim: true },
     isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);



const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
        id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },


  },
  { timestamps: true }
);


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
 
    location: {
     type: {
       type: String,
      enum: ['Point'],
    // default: 'Point'
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
    featured_image:      { type: String, default: '' },
    business_description:{ type: String, default: '' },
    gallery:             [{ type: String }],            // multiple images
  

    reviews: [reviewSchema],

  },
  { timestamps: true }
);

// ── Index ─────────────────────────────────────────────────────────
businessSchema.index({ host: 1 });
businessSchema.index({ business_category: 1, business_sub_category: 1 });
businessSchema.index({ plan: 1, is_active: 1 });



const Business = mongoose.model<IBusinessDocument, IBusinessModel>('Business', businessSchema);
export default Business;