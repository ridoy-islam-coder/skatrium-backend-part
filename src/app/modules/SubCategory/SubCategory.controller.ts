import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { subCategoryServices } from "./SubCategory.service";


// ✅ Get Sub-categories by Category
export const getSubsByCategory = catchAsync(async (req, res) => {
  const result = await subCategoryServices.getSubsByCategoryService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sub-categories fetched successfully',
    data: result,
  });
});

// ✅ Get Single Sub-category
export const getSubCategoryById = catchAsync(async (req, res) => {
  const result = await subCategoryServices.getSubCategoryByIdService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sub-category fetched successfully',
    data: result,
  });
});

// ✅ Create Sub-category
export const createSubCategory = catchAsync(async (req, res) => {
  const result = await subCategoryServices.createSubCategoryService(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Sub-category created successfully',
    data: result,
  });
});

// ✅ Update Sub-category
export const updateSubCategory = catchAsync(async (req, res) => {
  const result = await subCategoryServices.updateSubCategoryService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sub-category updated successfully',
    data: result,
  });
});

// ✅ Delete Sub-category
export const deleteSubCategory = catchAsync(async (req, res) => {
  const result = await subCategoryServices.deleteSubCategoryService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sub-category deleted successfully',
    data: result,
  });
});

export const subCategoryControllers = {
  getSubsByCategory,
  getSubCategoryById,   createSubCategory,  updateSubCategory,  deleteSubCategory,     };