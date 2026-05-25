import { Router } from 'express';
import {  getAllMerchants, socialControllers } from './social.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middleware/auth.middleware';
import upload from '../../middleware/fileUpload';



const router = Router();

// POST /api/v1/auth/register  ← User + SocialLink একসাথে save
router.post('/register',  upload.single('image'),  socialControllers.register);
router.put('/profile', socialControllers.updateProfile);
router.patch('/update-profile',auth(USER_ROLE.OWNER), upload.fields([{ name: 'profileImage', maxCount: 1 },{ name: 'coverImage', maxCount: 1 },]),socialControllers.updateProfile,);

router.get('/profile',auth(USER_ROLE.OWNER,),socialControllers.getProfile,);




//all merchant shop er jonno
router.post('/merchant-shop', auth(USER_ROLE.OWNER), upload.fields([{ name: 'image', maxCount: 1 }]), socialControllers.createMerchantShop);
router.put('/merchant-shop', auth(USER_ROLE.OWNER), upload.fields([{ name: 'image', maxCount: 1 }]), socialControllers.updateMerchantShop);
router.get('/merchant-shop', auth(USER_ROLE.OWNER), socialControllers.getMerchantShop);



//user id diye merchant shop details dekhte parbe
router.get('/merchant-shop/:userId', auth(USER_ROLE.OWNER), socialControllers.getMerchantShopByUserId);

// merchant.route.ts




// # Default — সব merchant
// GET /merchants

// # Search by shopName
// GET /merchants?search=Supreme

// # Business type filter
// GET /merchants?Buisness_Type=Skatewear

// # Category filter
// GET /merchants?Buisness_Category=664abc123

// # সব একসাথে
// GET /merchants?search=supreme&Buisness_Type=Skatewear&page=1&limit=10
router.get('/', getAllMerchants);

export const sosaleMediaRoutes = router;
