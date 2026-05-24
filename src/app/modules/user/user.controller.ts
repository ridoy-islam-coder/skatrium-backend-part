import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { uploadToS3 } from "../../utils/fileHelper";
import User from "./user.model";

// Get current user's profile
const getme = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getme(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Update user phone number (only phoneNumber & countryCode allowed)
const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updatePhoneNumber(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Phone number updated successfully',
    data: result,
  });
});





const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image;

  // Upload image if provided
  if (req.file) {
    image = await uploadToS3(req.file, 'profile/');
  }

  // Check role
  const isAdmin = req.user.role === 'USER' || req.user.role === 'influencer';

  // User can update own profile, admin can update others
  const userIdToUpdate =
    isAdmin && req.params.id ? req.params.id : req.user.id;

  // Admin updating own profile
  const isAdminUpdatingSelf =
    isAdmin && userIdToUpdate.toString() === req.user.id.toString();

  // Build update data
  const updateData: Record<string, any> = {
    ...req.body,
    ...(image && { image }),
  };

  // Make gender optional if admin updates own profile
  if (isAdminUpdatingSelf && !req.body.gender) {
    delete updateData.gender;
  }

    // Remove forbidden fields
  const forbiddenFields = ['role', 'isVerified']; // phoneNumber allowed now
  for (const key of forbiddenFields) delete updateData[key];

  // Optional: remove gender if missing
  // if (!req.body.gender) delete updateData.gender;


  // Update profile
  const result = await userServices.updateProfile(
    userIdToUpdate,
    updateData,
  );





  // (Optional) Save notification ONLY (no socket)
  // await saveNotification({
  //   userId: userIdToUpdate.toString(),
  //   title: 'Profile Updated',
  //   userType: 'User',
  //   message: 'Your profile has been updated successfully.',
  //   type: 'profile',
  // });

  // Response
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});


// Get single user (used by admin)
const getsingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSingleUser(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Get all users (used by admin)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Delete own account (soft delete)
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteAccount(
    req.user.id,
    req.body.password,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User account deleted successfully',
    data: result,
  });
});
//total users count by admin
const getTotalUsersCount = catchAsync(async (_req: Request, res: Response) => {
  const count = await userServices.getTotalUsersCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Total users count fetched successfully',
    data: count,
  });
});
//monthly user starts by admin
const getMonthlyUserStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await userServices.getMonthlyUserStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Monthly user stats fetched successfully',
    data: result,
  });
});
//Get 12-month user growth overview by admin
const getUserGrowthOverview = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;
    const result = await userServices.getUserGrowthPercentage(year);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: '12-month user growth fetched successfully',
      data: result,
    });
  },
);
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.blockUser(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User blocked successfully',
    data: result,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.unblockUser(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User unblocked successfully',
    data: result,
  });
});




// // GET /api/v1/users?role=ORGANIZER&search=john&page=1&limit=10
// const getUsersByRole = catchAsync(async (req: Request, res: Response) => {
//   const role = (req.query.role as string) || "ORGANIZER";

//   const search = req.query.search as string;
//   const page = req.query.page ? Number(req.query.page) : 1;
//   const limit = req.query.limit ? Number(req.query.limit) : 10;
 
//   const validRoles = ["ORGANIZER", "MARCHANT", "USER", "KAATEDJ"];
//   if (!validRoles.includes(role)) {
//     return res.status(httpStatus.BAD_REQUEST).json({
//       success: false,
//       message: `Invalid role. Valid roles: ${validRoles.join(", ")}`,
//     });
//   }
//  const currentUserId = req.user?._id; // ← add করো

//   const result = await userServices.getUsersByRole(role, search, page, limit,currentUserId);
 
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: `${role} profiles fetched successfully`,
//     data: result,
//   });
// });

const getUsersByRole = catchAsync(async (req: Request, res: Response) => {
  const role = (req.query.role as string) || "ORGANIZER";
  const search = req.query.search as string;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const country = req.query.country as string;
  const planningEventTypes = req.query.planningEventTypes as string; // ✅ নতুন

  const validRoles = ["ORGANIZER", "MARCHANT", "USER", "KAATEDJ"];
  if (!validRoles.includes(role)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: `Invalid role. Valid roles: ${validRoles.join(", ")}`,
    });
  }

  const currentUserId = req.user?._id;
  const result = await userServices.getUsersByRole(
    role,
    search,
    page,
    limit,
    currentUserId,
    country,
    planningEventTypes, // ✅ নতুন
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${role} profiles fetched successfully`,
    data: result,
  });
});


// GET /api/v1/users/:userId/profile
const getOrganizerProfile = catchAsync(async (req: Request, res: Response) => {
  const organizerId = req.params.userId;
  const currentUserId = req.user?._id;
 
  const result = await userServices.getOrganizerProfile(
    organizerId as string,
    currentUserId
  );
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organizer profile fetched successfully",
    data: result,
  });
});

// GET /api/v1/users/:userId/marchant-profile
const getMarchantProfile = catchAsync(async (req: Request, res: Response) => {
  const marchantId = req.params.userId;
  const currentUserId = req.user?._id;
 
  const result = await userServices.getMarchantProfile(
    marchantId as string,
    currentUserId
  );
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " profile fetched successfully",
    data: result,
  });
});








// GET /api/v1/subscribe-email
// Query: page, limit, search, status (active | inactive | all)
const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllSubscribers(req.query);
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscribed users retrieved successfully',
    data: result,
  });
});





// ═══════════════════════════════════════════════════════════════════
//  Get All Organizers (Active subscription on top)
// ═══════════════════════════════════════════════════════════════════
export const getAllOrganizersService = async (req: Request) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip  = (page - 1) * limit;

  const [organizers, total] = await Promise.all([
    User.aggregate([
      // ── Filter: শুধু ORGANIZER role ──────────────────────────
      {
        $match: {
          role:      'ORGANIZER',
          isDeleted: { $ne: true },
          isActive:  true,
        },
      },

      // ── isPro field add করো ──────────────────────────────────
      {
        $addFields: {
          isPro: {
            $cond: {
              if:   { $in: ['$subscription.status', ['active', 'trialing']] },
              then: true,
              else: false,
            },
          },
        },
      },

      // ── Sort: active subscription আগে, তারপর createdAt ──────
      {
        $sort: {
          isPro:     -1,
          createdAt: -1,
        },
      },

      // ── Pagination ────────────────────────────────────────────
      { $skip:  skip  },
      { $limit: limit },

      // ── শুধু দরকারী fields রাখো ──────────────────────────────
      {
        $project: {
          fullName:            1,
          email:               1,
          image:               1,
          coverImage:          1,
          about:               1,
          country:             1,
          phoneNumber:         1,
          isPro:               1,
          'subscription.status':    1,
          'subscription.expiresAt': 1,
          createdAt:           1,
        },
      },
    ]),

    // ── Total ORGANIZER count ─────────────────────────────────
    User.countDocuments({
      role:      'ORGANIZER',
      isDeleted: { $ne: true },
      isActive:  true,
    }),
  ]);

  return {
    data: organizers,
    pagination: {
      total,
      page,
      limit,
      totalPage:   Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const organizerServices = {
  getAllOrganizersService,
};



export const userControllers = {
  getme,
  updateProfile,
  getsingleUser,
  getAllUsers,
  deleteAccount,
  updatePhoneNumber,
  getTotalUsersCount,
  getMonthlyUserStats,
  getUserGrowthOverview,
  blockUser,
  unblockUser,
  getUsersByRole,
  getOrganizerProfile,
  getMarchantProfile,
  getAllSubscribers,
};
