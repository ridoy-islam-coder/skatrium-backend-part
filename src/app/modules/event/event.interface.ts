import { Types } from "mongoose";

// ═══════════════════════════════════════════════════════════════════
//  Promotion Interface
// ═══════════════════════════════════════════════════════════════════
export interface IPromotion {
  title: string;
  description?: string;
  discount_percentage?: string;
  last_date?: Date;
  lest_time?: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Cover Image Interface
// ═══════════════════════════════════════════════════════════════════
export interface ICoverImage {
  id?: string;
  url?: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Gallery Item Interface
// ═══════════════════════════════════════════════════════════════════
export interface IGalleryItem {
  id?: string;
  url?: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Review Interface  (was imported but not used in schema — kept here)
// ═══════════════════════════════════════════════════════════════════
export interface IReview {
  user: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════
//  Event Interface
// ═══════════════════════════════════════════════════════════════════
export interface IEvent {
  eventtitle: Types.ObjectId;       // ref: 'Business'
  eventsubtitle: Types.ObjectId;    // ref: 'Business'
  businessID: Types.ObjectId;       // ref: 'Business'
  date: Date;
  time?: string;
  description?: string;
  coverImage?: ICoverImage;
  gallery?: IGalleryItem[];
  host: Types.ObjectId;             // ref: 'User'
  isPast?: boolean;
  isDeleted?: boolean;
  promotions?: IPromotion[];
  createdAt?: Date;
  updatedAt?: Date;
}