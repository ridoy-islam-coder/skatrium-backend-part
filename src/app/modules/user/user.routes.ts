import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import { USER_ROLE } from "./user.constant";
import { userControllers } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { authValidation } from "../auth/auth.validation";
import upload from "../../middleware/fileUpload";
import { UserRole } from "./user.interface";

const router = Router();


// GET /organizers?page=1&limit=10&search=john&lat=23.8103&lng=90.4125&radiusKm=5&Buisness_Type=Restaurant&Buisness_owner_Type=Individual&Buisness_Category=664abc123&businesssub_category=664abc456&Second_BuisnessCategory=664abc789&Second_BusinessSubCategory=664abcabc
router.get('/get-business-owners',auth(UserRole.USER), userControllers.getAllbuignessowner);  // GET /api/organizers


router.get("/getby-roll", auth(UserRole.USER,UserRole.OWNER, UserRole.admin), userControllers.getUsersByRole);


router.get("/organizer-profile/:userId",auth(UserRole.USER, UserRole.OWNER, UserRole.admin),userControllers.getOrganizerProfile);



// GET /api/v1/users/:userId/marchant-profile
router.get("/marchant-profile/:userId",auth(UserRole.USER, UserRole.OWNER,UserRole.admin ),userControllers.getMarchantProfile);


// GET /api/v1/subscribe-email
router.get('/subscribe-email',auth(UserRole.admin),userControllers.getAllSubscribers,);





router.get(
  '/me',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.getme,
);



// For login user (user & admin both)
router.patch(
  '/update-profile',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  upload.single('image'),
  userControllers.updateProfile,
);
// //toatal user count
router.get(
  '/total-count',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.getTotalUsersCount,
);
router.get(
  '/monthly-user-stats',
  auth(USER_ROLE.admin),
  userControllers.getMonthlyUserStats,
);
router.get(
  '/user-growth-overview',
  auth(USER_ROLE.admin),
  userControllers.getUserGrowthOverview,
);

// For admin to update others
// router.patch(
//   '/:id',
//   auth(USER_ROLE.admin, USER_ROLE.sup_admin),
// //   upload.single('file'),
//   userControllers.updateProfile,
// );

router.patch(
  '/phone/update',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.updatePhoneNumber,
);
// router.get(
//   '/profile',
//   auth(USER_ROLE.agencies, USER_ROLE.influencer),
//   userControllers.getme,
// );
// Block user
router.patch(
  '/block/:id',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.blockUser,
);

// Unblock user
router.patch(
  '/unblock/:id',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.unblockUser,
);

router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.getsingleUser,
);
router.get(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.USER),
  userControllers.getAllUsers,
);

router.delete(
  '/delete-account',
  auth(USER_ROLE.USER, USER_ROLE.OWNER),
  validateRequest(authValidation.deleteAccountZodSchema),
  userControllers.deleteAccount,
);
export const userRoutes = router;