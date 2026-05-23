import express from 'express';
import { businessController } from './Business.controller';
import upload from '../../middleware/fileUpload';

const router = express.Router();

// ── File fields config (multer) ───────────────────────────────────
const businessFileFields = upload.fields([
  { name: 'featured_image', maxCount: 1  }, // 1:5 ratio image/video
  { name: 'gallery',        maxCount: 10 }, // multiple images
]);



// router.get('/my-business',  businessController.getMyBusiness);

router.post('/create-business',businessFileFields,businessController.createBusiness);

// router.patch('/update-business/:id',businessFileFields, businessController.updateBusiness);

// router.delete('/delete-business/:id', businessController.deleteBusiness);



export default router;