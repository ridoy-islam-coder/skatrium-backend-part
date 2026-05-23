import { Document, Types } from 'mongoose';

// ═══════════════════════════════════════════════════════════════════
//  Enums
// ═══════════════════════════════════════════════════════════════════
export enum BusinessType {
  ONLINE  = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID  = 'HYBRID',
}

export enum SpotlightNature {
  SPOTLIGHT_NATURE = 'SPOTLIGHT_NATURE',
  // add more values if needed
}

// ═══════════════════════════════════════════════════════════════════
//  Sub Interfaces
// ═══════════════════════════════════════════════════════════════════
export interface IReviewImage {
  id?:  string;
  url?: string;
}

export interface IReply {
  user:      Types.ObjectId;
  comment:   string;
  isRead?:   boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  user:        Types.ObjectId;
  rating:      number;           // 1–5
  comment:     string;
  images?:     IReviewImage[];
  isAnonymous?: boolean;
  createdAt?:  Date;
  updatedAt?:  Date;
}

export interface IGeoLocation {
  type:        'Point';
  coordinates: number[];         // [longitude, latitude]
}

// ═══════════════════════════════════════════════════════════════════
//  Main Business Document Interface
// ═══════════════════════════════════════════════════════════════════
export interface IBusinessDocument extends Document {
  host:                  Types.ObjectId;       // ref: 'User'
  business_name:         string;
  business_type?:        BusinessType;
  business_category:     Types.ObjectId;       // ref: 'Category'
  business_sub_category: Types.ObjectId;       // ref: 'SubCategory'
  location?:             IGeoLocation;
  get_velocity_option?:  SpotlightNature;

  // Images
  featured_image?:       string;
  featured_image_key?:   string;               // S3 key for deletion
  business_description?: string;
  gallery?:              string[];
  gallery_keys?:         string[];             // S3 keys for deletion

  // Reviews
  reviews?: IReview[];

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}