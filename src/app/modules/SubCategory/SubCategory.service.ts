import { Request } from 'express';
import mongoose from 'mongoose';
import { Category } from '../eventcatagore/eventcatagore.model';
import SubCategory, { ISubCategoryDocument } from './SubCategory.model';


// ✅ Get Sub-categories by Category
export const getSubsByCategoryService = async (req: Request): Promise<ISubCategoryDocument[]> => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  const subCategories = await SubCategory.find({
    category_id: new mongoose.Types.ObjectId(categoryId as string),
    is_active: true,
  })
    .populate('category_id', 'name description isActive image')
    .sort({ sort_order: 1 });

  return subCategories;
};

// ✅ Get Single Sub-category
export const getSubCategoryByIdService = async (req: Request): Promise<ISubCategoryDocument> => {
  const { id } = req.params;

  const subCategory = await SubCategory.findById(id).populate(
    'category_id',
    'name description isActive image'
  );

  if (!subCategory) {
    throw new Error('Sub-category not found');
  }

  return subCategory;
};

// ✅ Create Sub-category
export const createSubCategoryService = async (req: Request): Promise<ISubCategoryDocument> => {
  const { category_id, name, description, } = req.body;

  const categoryExists = await Category.findById(category_id);
  if (!categoryExists) {
    throw new Error('Parent category does not exist');
  }

  const subCategory = await SubCategory.create({
    category_id: new mongoose.Types.ObjectId(category_id as string),
    name,
    description,
  
  });

  return subCategory;
};

// ✅ Update Sub-category
export const updateSubCategoryService = async (req: Request): Promise<ISubCategoryDocument> => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!subCategory) {
    throw new Error('Sub-category not found');
  }

  return subCategory;
};

// ✅ Delete Sub-category
export const deleteSubCategoryService = async (req: Request): Promise<ISubCategoryDocument> => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(id);

  if (!subCategory) {
    throw new Error('Sub-category not found');
  }

  return subCategory;
};


export const subCategoryServices = {
  getSubsByCategoryService,
  getSubCategoryByIdService,
    createSubCategoryService,
    updateSubCategoryService,
    deleteSubCategoryService,
};