import express from 'express';
import { businessController } from './Business.controller';
import upload from '../../middleware/fileUpload';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth.middleware';

const router = express.Router();

// ── File fields config (multer) ───────────────────────────────────
const businessFileFields = upload.fields([
  { name: 'featured_image', maxCount: 1  }, // 1:5 ratio image/video
  { name: 'gallery',        maxCount: 10 }, // multiple images
]);



router.get('/my-business',auth(USER_ROLE.USER),  businessController.getMyBusinesses);
router.get('/business-details/:id', auth(USER_ROLE.USER), businessController.getBusinessDetails);

router.post('/create-business', auth(USER_ROLE.USER), businessFileFields, businessController.createBusiness);

router.patch('/update-business/:id',auth(USER_ROLE.USER), businessFileFields, businessController.updateBusiness);

router.delete('/delete-business/:id', auth(USER_ROLE.USER), businessController.deleteBusiness);



export const businessRoutes = router;