import mongoose, { Document, Model } from 'mongoose';

// ═══════════════════════════════════════════════════════════════════
//  Enums
// ═══════════════════════════════════════════════════════════════════
export enum BusinessType {
  ONLINE  = 'Online',
  OFFLINE = 'Offline',
  BOTH    = 'Both',
}

export enum SpotlightNature {
  SPOTLIGHT_NATURE = 'Spotlight Nature',
  FEATURED         = 'Featured',
  PROMOTED         = 'Promoted',
}
export interface ILocation {
  type: "Point";
  coordinates: [longitude: number, latitude: number];
}
// ═══════════════════════════════════════════════════════════════════
//  Review Image Interface
// ═══════════════════════════════════════════════════════════════════
export interface IReviewImage {
  id:  string;
  url: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Review Interface  (reviewSchema এর সাথে same)
// ═══════════════════════════════════════════════════════════════════
export interface IReview {
  user:        mongoose.Types.ObjectId;
  rating:      number;               // min: 1, max: 5
  comment:     string;
  images:      IReviewImage[];
  isAnonymous: boolean;
  createdAt?:  Date;
  updatedAt?:  Date;
}

// ═══════════════════════════════════════════════════════════════════
//  Main Business Interface  (businessSchema এর সাথে same)
// ═══════════════════════════════════════════════════════════════════
export interface IBusiness {
  host:                  mongoose.Types.ObjectId;
  business_name:         string;
  business_type:         BusinessType;
  business_category:     mongoose.Types.ObjectId;
  business_sub_category: mongoose.Types.ObjectId;
  location:              ILocation;
  get_velocity_option:   SpotlightNature;
  featured_image:        string;        // 1:5 ratio image/video
  business_image:        string;
  business_description:  string;
  gallery:               string[];      // multiple images
  reviews:               IReview[];
}

// ═══════════════════════════════════════════════════════════════════
//  Document Interface  (Mongoose _id, createdAt, updatedAt সহ)
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessDocument extends IBusiness, Document {
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════
//  Model Interface
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessModel extends Model<IBusinessDocument> {}