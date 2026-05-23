import express from 'express';
import upload from '../middleware/upload';
import * as businessControllers from './business.controller';

const router = express.Router();

// ── File fields config (multer) ───────────────────────────────────
const businessFileFields = upload.fields([
  { name: 'featured_image', maxCount: 1  }, // 1:5 ratio image/video
  { name: 'business_logo',  maxCount: 1  }, // logo
  { name: 'business_image', maxCount: 1  }, // cover image
  { name: 'gallery',        maxCount: 10 }, // multiple images
]);



router.get('/my-business',  businessControllers.getMyBusiness);

router.post('/create-business',businessFileFields,businessControllers.createBusiness);

router.patch('/update-business/:id',businessFileFields, businessControllers.updateBusiness);

router.delete('/delete-business/:id', businessControllers.deleteBusiness);



export default router;