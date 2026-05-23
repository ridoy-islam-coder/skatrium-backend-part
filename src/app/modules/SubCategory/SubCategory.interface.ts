
// ═══════════════════════════════════════════════════════════════════
//  Interface — plain data shape (DB ছাড়া)

import mongoose, { Model } from "mongoose";

// ═══════════════════════════════════════════════════════════════════
export interface ISubCategory {
  category_id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

// ═══════════════════════════════════════════════════════════════════
//  Document Interface — Mongoose এর _id, createdAt, updatedAt সহ
// ═══════════════════════════════════════════════════════════════════
export interface ISubCategoryDocument extends ISubCategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════
//  Model Interface — static methods এখানে রাখা যাবে (দরকার হলে)
// ═══════════════════════════════════════════════════════════════════
export interface ISubCategoryModel extends Model<ISubCategoryDocument> {
  // ভবিষ্যতে static method লাগলে এখানে declare করুন
  // findByCategory(categoryId: string): Promise<ISubCategoryDocument[]>;
}