import mongoose, { Document, Model, Schema } from 'mongoose';


// ═══════════════════════════════════════════════════════════════════
//  Interface — plain data shape (DB ছাড়া)
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

// ═══════════════════════════════════════════════════════════════════
//  Schema
// ═══════════════════════════════════════════════════════════════════
const subCategorySchema = new Schema<ISubCategoryDocument, ISubCategoryModel>(
  {
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
    },
    name: {
      type: String,
      required: [true, 'Sub-category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
 
    description: {
      type: String,
      default: '',
    },
 
    is_active: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true,
  }
);

// ── Index: category_id দিয়ে দ্রুত query করতে ─────────────────────
subCategorySchema.index({ category_id: 1, sort_order: 1 });

const SubCategory = mongoose.model<ISubCategoryDocument, ISubCategoryModel>(
  'SubCategory',
  subCategorySchema
);

export default SubCategory;