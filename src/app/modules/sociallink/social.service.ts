import AppError from "../../error/AppError";
import httpStatus from 'http-status';
import User from "../user/user.model";
import SocialLink from "./soscial.model";
import { createToken } from "../auth/auth.utils";
import config from "../../config";
import { deleteFromS3, deleteManyFromS3, uploadToS3 } from "../../utils/fileHelper";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { Personalization } from "../Personalizationuser/Personalization.model";
import { Request as ExpressRequest } from 'express';
import { PipelineStage } from "mongoose";
import { Types } from "mongoose";

// const register = async (payload: {
//   fullName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
//   country?: string;
//   phoneNumber?: string;
//   howDidYouHear?: string;
//   subscribeToEmails?: boolean;
//   termsAccepted: boolean;

//   shopName?: string;
//   shopLink?: string;
//   facebook?: string;
//   instagram?: string;
//   linkedin?: string;
//   twitter?: string;
//   youtube?: string;
//   tiktok?: string;
//   website?: string;
// }) => {
//   const {
//     fullName,
//     email,
//     password,
//     confirmPassword,
//     role,
//     country,
//     phoneNumber,
//     howDidYouHear,
//     subscribeToEmails,
//     termsAccepted,

//     shopName,
//     shopLink,
//     facebook,
//     instagram,
//     linkedin,
//     twitter,
//     youtube,
//     tiktok,
//     website,
//   } = payload;

//   // ── Validations ─────────────────────────────────
//   if (!termsAccepted) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You must accept the Terms and Conditions.',
//     );
//   }

//   if (password !== confirmPassword) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Passwords do not match.',
//     );
//   }

//   if (password.length < 6) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Password must be at least 6 characters long.',
//     );
//   }

//   // ── Duplicate check ─────────────────────────────
//   const existingEmail = await User.findOne({ email });
//   if (existingEmail) {
//     throw new AppError(
//       httpStatus.CONFLICT,
//       'An account with this email already exists.',
//     );
//   }

//   if (phoneNumber) {
//     const existingPhone = await User.findOne({ phoneNumber });
//     if (existingPhone) {
//       throw new AppError(
//         httpStatus.CONFLICT,
//         'An account with this phone number already exists.',
//       );
//     }
//   }

//   // ── PART 1: Create User ─────────────────────────
//   const user = await User.create({
//     fullName,
//     email,
//     password,
//     role,
//     country: country || undefined,
//     phoneNumber: phoneNumber || undefined,
//     howDidYouHear: howDidYouHear || '',
//     subscribeToEmails: subscribeToEmails ?? false,
//     termsAccepted,
//     accountType: 'emailvarifi',
//     isVerified: false,
//     isActive: true,
//     needsPasswordChange: false,
//   });

//   console.log("🚀 ~ file: social.controller.ts:122 ~ register ~ user:", user)
//   // ── PART 2: Create SocialLink (if provided) ─────
//   const hasSocialData =
//     shopName || shopLink || facebook || instagram ||
//     linkedin || twitter || youtube || tiktok || website;

//   if (hasSocialData) {
//     await SocialLink.create({
//       user: user._id,
//       shopName: shopName || '',
//       shopLink: shopLink || '',
//       facebook: facebook || '',
//       instagram: instagram || '',
//       linkedin: linkedin || '',
//       twitter: twitter || '',
//       youtube: youtube || '',
//       tiktok: tiktok || '',
//       website: website || '',
//     });
//   }

//   console.log("🚀 ~ file: social.controller.ts:149 ~ register ~ user._id:", hasSocialData)

//   // ── Generate Token ──────────────────────────────
//   const jwtPayload = {
//     userId: user?._id.toString(),
//     role: user?.role,
//   };

//   const accessToken = createToken(
//     jwtPayload,
//     config.jwt.jwt_access_secret as string,
//     config.jwt.jwt_access_expires_in as string,
//   );

//   return {
//     accessToken,
//     user: {
//       _id: user._id,
//       fullName: user.fullName,
//       email: user.email,
//       role: user.role,
//       isVerified: user.isVerified,
//     },
//   };
// };














const updateProfile = async (
  user: JwtPayload,
  body: Record<string, unknown>,
  files: Record<string, Express.Multer.File[]> | undefined,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userUpdateData: Record<string, unknown> = {};

    const userFields = [
      'fullName', 'phoneNumber', 'country',
      'language', 'howDidYouHear', 'subscribeToEmails',
    ];
    for (const field of userFields) {
      if (body[field] !== undefined) {
        userUpdateData[field] = body[field];
      }
    }

    // ─── Profile Image ───────────────────────────────────────
    if (files?.profileImage?.[0]) {
      const existingUser = await User.findById(user.id);

      if (existingUser?.image?.id) {
        await deleteFromS3(String(existingUser.image.id)); // ✅ single string
      }

      const uploaded = await uploadToS3(files.profileImage[0], 'profile-images');
      userUpdateData['image'] = {
        id: uploaded.id,
        url: uploaded.url,
      };
    }

    // ─── Cover Image ─────────────────────────────────────────
    if (files?.coverImage?.[0]) {
      const existingUser = await User.findById(user.id);

      if (existingUser?.coverImage?.id) {
        await deleteFromS3(String(existingUser.coverImage.id)); // ✅ single string
      }

      const uploaded = await uploadToS3(files.coverImage[0], 'cover-images');
      userUpdateData['coverImage'] = {
        id: uploaded.id,
        url: uploaded.url,
      };
    }

    // ─── Update User ─────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: userUpdateData },
      { new: true, session },
    );

    if (!updatedUser) throw new Error('User not found');

    // ─── Social Link fields ──────────────────────────────────
    const socialFields = [
      'shopName', 'shopLink', 'facebook', 'instagram',
      'linkedin', 'twitter', 'youtube', 'tiktok', 'website',
    ];
    const socialUpdateData: Record<string, unknown> = {};

    for (const field of socialFields) {
      if (body[field] !== undefined) {
        socialUpdateData[field] = body[field];
      }
    }

    let updatedSocial = null;
    if (Object.keys(socialUpdateData).length > 0) {
      updatedSocial = await SocialLink.findOneAndUpdate(
        { user: user.id },
        { $set: socialUpdateData },
        { new: true, upsert: true, session },
      );
    }

    await session.commitTransaction();
    return { user: updatedUser, socialLinks: updatedSocial };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};



const getProfile = async (user: JwtPayload) => {
  const result = await User.findById(user.id)
    .select('+coverImage')
    .populate({
      path: 'subscription.plan',
      select: 'name price duration features ',
    });

  if (!result) throw new Error('User not found');

  // Social links also fetch koro
  const socialLinks = await SocialLink.findOne({ user: user.id });
  const Personalizationdata = await Personalization.findOne({ user: user.id });

  return { user: result, socialLinks, Personalization: Personalizationdata };
};









export const register = async (payload: any) => {
  const {
    fullName,
    email,
    about,
    password,
    confirmPassword,
    role,
    country,
    phoneNumber,
    howDidYouHear,
    subscribeToEmails,
    termsAccepted,
    longitude,
    latitude,
    // 🔥 social fields
    shopName,
    shoptype,
    facebook,
    instagram,
    linkedin,
    twitter,
    youtube,
    tiktok,
    website,
    shoplink,
    file, // 👈 image



    // new data
    businesssub_category,
    Buisness_Category,
    Buisness_owner_Type,
    Buisness_Type,
  } = payload;


   
  // ✅ Validations
  if (!termsAccepted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Accept terms first');
  }

  if (password !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not match');
  }

  if (password.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password too short');
  }

  // ✅ Duplicate check
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'Email already exists');
  }

  if (phoneNumber) {
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      throw new AppError(httpStatus.CONFLICT, 'Phone already exists');
    }
  }

  // ✅ Upload Image
  let uploadedImage;
  if (file) {
    uploadedImage = await uploadToS3(file, 'user');
  }
  
 // ✅ Geo location build
  let geoLocation;

  if (longitude && latitude) {
    geoLocation = {
      type: "Point",
      coordinates: [
        parseFloat(longitude),
        parseFloat(latitude),
      ],
    };
  }

  // ✅ Create User
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    about: about || '',
    image: uploadedImage
      ? {
          id: uploadedImage.id,
          url: uploadedImage.url,
        }
      : undefined,
    location: geoLocation,
    country: country || undefined,
    phoneNumber: phoneNumber || undefined,
    howDidYouHear: howDidYouHear || '',
    subscribeToEmails: subscribeToEmails ?? false,
    termsAccepted,
    accountType: 'emailvarifi',
    isVerified: false,
    isActive: true,
    needsPasswordChange: false,
  });

  // ✅ Create Social Links (if any data exists)
  const hasSocialData =
    shopName || shoptype || facebook || instagram ||
    linkedin || twitter || youtube || tiktok || website || shoplink || businesssub_category || Buisness_Category || Buisness_owner_Type || Buisness_Type;

  if (hasSocialData) {
    await SocialLink.create({
      user: user._id,
      shopName: shopName || '',
      shoptype: shoptype || '',
      facebook: facebook || '',
      instagram: instagram || '',
      linkedin: linkedin || '',
      twitter: twitter || '',
      youtube: youtube || '',
      tiktok: tiktok || '',
      website: website || '',
      shoplink: shoplink || '',
      businesssub_category: businesssub_category || null,
      Buisness_Category: Buisness_Category || null,
      Buisness_owner_Type: Buisness_owner_Type || '',
      Buisness_Type: Buisness_Type || '',
    });
  }


  // ── Generate Token ──────────────────────────────
  const jwtPayload = {
    userId: user?._id.toString(),
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string,
  );

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      image: user.image,
      isVerified: user.isVerified,
    },
    accessToken
  };
};





// ═══════════════════════════════════════════════════════════════════
//  Create Merchant Shop Service
// ═══════════════════════════════════════════════════════════════════
export const createMerchantShopService = async (req: ExpressRequest) => {
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };
 
  // ── Check already exists ──────────────────────────────────────
  const existing = await SocialLink.findOne({ user: userId });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Merchant shop already exists. Use update instead.');
  }
 
  // ── Image upload ──────────────────────────────────────────────
  let image = { id: '', url: '' };
 
  if (files?.image?.[0]) {
    // uploadToS3(file, fileName) → { id: uniqueFileName, url: s3Url }
    const uploaded = await uploadToS3(files.image[0], 'merchant/profile');
    image          = { id: uploaded.id, url: uploaded.url };  // ✅
  }
 
  const {
    shopName, shoptype, shoplink,
    facebook, instagram, linkedin, twitter, youtube, tiktok, website,
    Buisness_Category, businesssub_category, Buisness_owner_Type, Buisness_Type,
    Second_BuisnessCategory, Second_BusinessSubCategory,
  } = req.body;
 
  const socialLink = await SocialLink.create({
    user: userId,
    shopName, shoptype, shoplink,
    facebook, instagram, linkedin, twitter, youtube, tiktok, website,
    image,                                                     // ✅ { id, url }
    Buisness_Category, businesssub_category,
    Buisness_owner_Type, Buisness_Type,
    Second_BuisnessCategory, Second_BusinessSubCategory,
  });
 
  return socialLink;
};
 
// ═══════════════════════════════════════════════════════════════════
//  Update Merchant Shop Service
// ═══════════════════════════════════════════════════════════════════
export const updateMerchantShopService = async (req: ExpressRequest) => {
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };
 
  // ── Find existing ─────────────────────────────────────────────
  const existing = await SocialLink.findOne({ user: userId });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Merchant shop not found');
  }
 
  // ── Image update ──────────────────────────────────────────────
  let image = {
    id:  existing.image?.id  ?? '',
    url: existing.image?.url ?? '',
  };
 
  if (files?.image?.[0]) {
    // পুরনো image S3 থেকে delete করো
    if (existing.image?.id) {
      await deleteFromS3(existing.image.id);                   // ✅ key দিয়ে delete
    }
    const uploaded = await uploadToS3(files.image[0], 'merchant/profile');
    image          = { id: uploaded.id, url: uploaded.url };  // ✅ নতুন { id, url }
  }
 
  const {
    shopName, shoptype, shoplink,
    facebook, instagram, linkedin, twitter, youtube, tiktok, website,
    Buisness_Category, businesssub_category, Buisness_owner_Type, Buisness_Type,
    Second_BuisnessCategory, Second_BusinessSubCategory,
  } = req.body;
 
  const updated = await SocialLink.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        shopName, shoptype, shoplink,
        facebook, instagram, linkedin, twitter, youtube, tiktok, website,
        image,                                                 // ✅ { id, url }
        Buisness_Category, businesssub_category,
        Buisness_owner_Type, Buisness_Type,
        Second_BuisnessCategory, Second_BusinessSubCategory,
      },
    },
    { new: true, runValidators: true }
  );
 
  return updated;
};



export const getMerchantShopService = async (req: ExpressRequest) => {
  const userId = req.user?.id;

  const socialLink = await SocialLink.findOne({ user: userId })
    .populate('Buisness_Category',          'name slug')
    .populate('businesssub_category',       'name slug')
    .populate('Second_BuisnessCategory',    'name slug')
    .populate('Second_BusinessSubCategory', 'name slug');

  if (!socialLink) {
    throw new AppError(httpStatus.NOT_FOUND, 'Merchant shop not found');
  }

  return socialLink;
};

















export const getAllMerchantsService = async (req: any) => {
  const page   = parseInt(req.query.page  as string) || 1;
  const limit  = parseInt(req.query.limit as string) || 10;
  const skip   = (page - 1) * limit;
  const search = (req.query.search as string)?.trim() || '';

  // ── Filter params ─────────────────────────────────────────────
  const businessType        = req.query.Buisness_Type              as string;
  const businessOwnerType   = req.query.Buisness_owner_Type        as string;
  const businessCategory    = req.query.Buisness_Category          as string;
  const businessSubCategory = req.query.businesssub_category       as string;
  const secondCategory      = req.query.Second_BuisnessCategory    as string;
  const secondSubCategory   = req.query.Second_BusinessSubCategory as string;

  // ── Base match ────────────────────────────────────────────────
  const baseMatch: any = {};

  if (search) {
    baseMatch.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { shoptype: { $regex: search, $options: 'i' } },
    ];
  }

  if (businessType)        baseMatch.Buisness_Type       = businessType;
  if (businessOwnerType)   baseMatch.Buisness_owner_Type = businessOwnerType;
  if (businessCategory)    baseMatch.Buisness_Category   = new Types.ObjectId(businessCategory);
  if (businessSubCategory) baseMatch.businesssub_category = new Types.ObjectId(businessSubCategory);
  if (secondCategory)      baseMatch.Second_BuisnessCategory    = new Types.ObjectId(secondCategory);
  if (secondSubCategory)   baseMatch.Second_BusinessSubCategory = new Types.ObjectId(secondSubCategory);

  const pipeline: PipelineStage[] = [
    { $match: baseMatch },

    // ── User info আনো ─────────────────────────────────────────
    {
      $lookup: {
        from:         'users',
        localField:   'user',
        foreignField: '_id',
        as:           'userInfo',
        pipeline: [
          {
            $match: {
              isDeleted: { $ne: true },
              isActive:  true,
            },
          },
          {
            $project: {
              fullName:    1,
              email:       1,
              image:       1,
              coverImage:  1,
              country:     1,
              phoneNumber: 1,
              'subscription.status':    1,
              'subscription.expiresAt': 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false } },

    // ── isPro field ───────────────────────────────────────────
    {
      $addFields: {
        isPro: {
          $cond: {
            if:   { $in: ['$userInfo.subscription.status', ['active', 'trialing']] },
            then: true,
            else: false,
          },
        },
      },
    },

    // ── Category lookup ───────────────────────────────────────
    {
      $lookup: {
        from:         'categories',
        localField:   'Buisness_Category',
        foreignField: '_id',
        as:           'Buisness_Category',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: { path: '$Buisness_Category', preserveNullAndEmptyArrays: true } },

    // ── SubCategory lookup ────────────────────────────────────
    {
      $lookup: {
        from:         'subcategories',
        localField:   'businesssub_category',
        foreignField: '_id',
        as:           'businesssub_category',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: { path: '$businesssub_category', preserveNullAndEmptyArrays: true } },

    // ── Second Category lookup ────────────────────────────────
    {
      $lookup: {
        from:         'categories',
        localField:   'Second_BuisnessCategory',
        foreignField: '_id',
        as:           'Second_BuisnessCategory',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: { path: '$Second_BuisnessCategory', preserveNullAndEmptyArrays: true } },

    // ── Second SubCategory lookup ─────────────────────────────
    {
      $lookup: {
        from:         'subcategories',
        localField:   'Second_BusinessSubCategory',
        foreignField: '_id',
        as:           'Second_BusinessSubCategory',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: { path: '$Second_BusinessSubCategory', preserveNullAndEmptyArrays: true } },

    // ── Sort: isPro আগে ───────────────────────────────────────
    { $sort: { isPro: -1, createdAt: -1 } },

    // ── Facet ─────────────────────────────────────────────────
    {
      $facet: {
        data: [
          { $skip:  skip  },
          { $limit: limit },
          {
            $project: {
              shopName:                  1,
              shoptype:                  1,
              shoplink:                  1,
              image:                     1,
              facebook:                  1,
              instagram:                 1,
              linkedin:                  1,
              twitter:                   1,
              youtube:                   1,
              tiktok:                    1,
              website:                   1,
              isPro:                     1,
              Buisness_Type:             1,
              Buisness_owner_Type:       1,
              Buisness_Category:         1,
              businesssub_category:      1,
              Second_BuisnessCategory:   1,
              Second_BusinessSubCategory: 1,
              createdAt:                 1,
              // User info
              'userInfo.fullName':       1,
              'userInfo.email':          1,
              'userInfo.image':          1,
              'userInfo.coverImage':     1,
              'userInfo.country':        1,
              'userInfo.phoneNumber':    1,
              'userInfo.subscription':   1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await SocialLink.aggregate(pipeline);

  const data  = result?.data               ?? [];
  const total = result?.totalCount[0]?.count ?? 0;

  return {
    data,
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
export const sosalServices = {
  register,
  updateProfile,
  getProfile,
  createMerchantShopService,
  updateMerchantShopService,
  getMerchantShopService,
};