import { model, Schema, Types } from 'mongoose';



// ─── Interface ────────────────────────────────────────────────────────────────
export interface TSocialLink {
  user: Types.ObjectId;
  shopName?: string;
  shoptype?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  shoplink?: string;
  website?: string;
   image?: {
    id:  string;
    url: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  businesssub_category?: Types.ObjectId;
  Buisness_Category: Types.ObjectId;
  Buisness_owner_Type: string;
  Buisness_Type: string;
  Second_BuisnessCategory?: Types.ObjectId;
  Second_BusinessSubCategory?: Types.ObjectId;
}


const imageSchema = new Schema({
  id:  { type: String, required: true },
  url: { type: String, default: "", required: true },
  default: {},
});
// ─── Schema ───────────────────────────────────────────────────────────────────
const SocialLinkSchema = new Schema<TSocialLink>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // একজন user এর জন্য একটাই SocialLink document
    },
    shopName: {
      type: String,
      default: '',
    },
    shoptype: {
      type: String,
      default: '',
    },
     shoplink: {
      type: String,
      default: '',
    },

    facebook: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    youtube: {
      type: String,
      default: '',
    },
    tiktok: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    //  image: imageSchema,
    image: {
      type: imageSchema,
      default: null,
    },
    businesssub_category: {
       type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    Buisness_Category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
     Second_BuisnessCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
      Second_BusinessSubCategory: {
       type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    Buisness_owner_Type: {
      type: String,
      default: '',
    },

    Buisness_Type: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  },
);

const SocialLink = model<TSocialLink>('SocialLink', SocialLinkSchema);
export default SocialLink;