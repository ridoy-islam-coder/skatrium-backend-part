import { Router } from 'express';
import {  socialControllers } from './social.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth.middleware';
import upload from '../../middleware/fileUpload';



const router = Router();
// POST /api/v1/auth/register  ← User + SocialLink একসাথে save
router.post('/register',  upload.single('image'),  socialControllers.register);
router.put('/profile', socialControllers.updateProfile);
router.patch('/update-profile',auth(USER_ROLE.KAATEDJ,USER_ROLE.ORGANIZER), upload.fields([{ name: 'profileImage', maxCount: 1 },{ name: 'coverImage', maxCount: 1 },]),socialControllers.updateProfile,);

router.get('/profile',auth(USER_ROLE.KAATEDJ,USER_ROLE.ORGANIZER),socialControllers.getProfile,);




//all merchant shop er jonno
router.post('/merchant-shop', auth(USER_ROLE.ORGANIZER), upload.fields([{ name: 'image', maxCount: 1 }]), socialControllers.createMerchantShop);
router.put('/merchant-shop', auth(USER_ROLE.ORGANIZER), upload.fields([{ name: 'image', maxCount: 1 }]), socialControllers.updateMerchantShop);
router.get('/merchant-shop', auth(USER_ROLE.ORGANIZER), socialControllers.getMerchantShop);
export const sosaleMediaRoutes = router;
