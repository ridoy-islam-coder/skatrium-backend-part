import mongoose, { Document, Model } from 'mongoose';

// ═══════════════════════════════════════════════════════════════════
//  Promotion Interface
// ═══════════════════════════════════════════════════════════════════
export interface IPromotion {
  title:               string;
  description:         string;
  discount_percentage: string;
  last_date?:          Date;
  lest_time?:          string;
}

// ═══════════════════════════════════════════════════════════════════
//  Gallery Item Interface
// ═══════════════════════════════════════════════════════════════════
export interface IGalleryItem {
  id:  string;
  url: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Cover Image Interface
// ═══════════════════════════════════════════════════════════════════
export interface ICoverImage {
  id:  string;
  url: string;
}

// ═══════════════════════════════════════════════════════════════════
//  Event Interface  (schema এর সাথে exact match)
// ═══════════════════════════════════════════════════════════════════
export interface IEvent {
  eventtitle:    string;
  eventsubtitle:  string;
  businessID:    mongoose.Types.ObjectId;
  date:          Date;
  time:          string;
  description:   string;
  coverImage:    ICoverImage;
  gallery:       IGalleryItem[];       // required — never undefined
  host:          mongoose.Types.ObjectId;
  isPast:        boolean;
  isDeleted:     boolean;
  promotions:    IPromotion[];
}

// ═══════════════════════════════════════════════════════════════════
//  Document Interface
// ═══════════════════════════════════════════════════════════════════
export interface IEventDocument extends IEvent, Document {
  createdAt?: Date;
  updatedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════
//  Model Interface
// ═══════════════════════════════════════════════════════════════════
export interface IEventModel extends Model<IEventDocument> {}