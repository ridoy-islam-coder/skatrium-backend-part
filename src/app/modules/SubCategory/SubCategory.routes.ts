import express from 'express';
import { subCategoryControllers } from './SubCategory.controller';


const router = express.Router();

// ✅ Public routes
router.get('/category/:categoryId', subCategoryControllers.getSubsByCategory);
router.get('/:id', subCategoryControllers.getSubCategoryById);

// ✅ Admin routes
router.post('/', subCategoryControllers.createSubCategory);
router.patch('/:id', subCategoryControllers.updateSubCategory);
router.delete('/:id', subCategoryControllers.deleteSubCategory);

export default router;