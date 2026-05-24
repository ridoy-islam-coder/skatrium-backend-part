import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { Request as ExpressRequest } from 'express';
import  httpStatus  from 'http-status';
import sendResponse from "../../utils/sendResponse";
import { sosalServices } from "./social.service";
import AppError from "../../error/AppError";

// Register + Merchant Profile একসাথে
// const register = catchAsync(async (req: Request, res: Response) => {
//   const result = await sosalServices.register(req.body);
//     console.log("🚀 ~ file: social.controller.ts:17 ~ register ~ result:", result)
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Registration completed successfully.',
//     data: result,
//   });
// });
 
// Login
// const login = catchAsync(async (req: Request, res: Response) => {
//   const result = await authServices.login(req.body);
 
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Login successful',
//     data: result,
//   });
// });


const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await sosalServices.updateProfile(
    req.user,
    req.body,          // form-data er text fields
    req.files as Record<string, Express.Multer.File[]>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});




const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await sosalServices.getProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});








export const register = catchAsync(async (req: Request, res: Response) => {


  //  Service call (ALL DATA + IMAGE)
  const result = await sosalServices.register({
    ...req.body,

    // 🔥 image file
    file: req.file,

    // 🔥 social fields explicitly (optional but safe)
    shopName: req.body.shopName,
    shoptype: req.body.shoptype,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    linkedin: req.body.linkedin,
    twitter: req.body.twitter,
    youtube: req.body.youtube,
    tiktok: req.body.tiktok,
    website: req.body.website,
    shoplink: req.body.shoplink,
    businesssub_category: req.body.businesssub_category,
    Buisness_Category: req.body.Buisness_Category,
    Buisness_owner_Type: req.body.Buisness_owner_Type,
    Buisness_Type: req.body.Buisness_Type,
  });

  //  Response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Registration completed successfully.',
    data: result,
  });
});


// ═══════════════════════════════════════════════════════════════════
//  Create Merchant Shop
// ═══════════════════════════════════════════════════════════════════
// ✅ এইভাবে করো — req, res দুটোই দাও
export const createMerchantShop = catchAsync(async (req, res) => {
  const result = await sosalServices.createMerchantShopService(req);
  sendResponse(res, {
    statusCode: 201,
    success:    true,
    message:    'Merchant shop created successfully',
    data:       result,
  });
});
 
// ═══════════════════════════════════════════════════════════════════
//  Update Merchant Shop
// ═══════════════════════════════════════════════════════════════════
export const updateMerchantShop = catchAsync(async (req, res) => {
  const result = await sosalServices.updateMerchantShopService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Merchant shop updated successfully',
    data:       result,
  });
});



export const getMerchantShop = catchAsync(async (req, res) => {
  const result = await sosalServices.getMerchantShopService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Merchant shop fetched successfully',
    data:       result,
  });
});
 
export const socialControllers = {
  register,
  updateProfile,
  getProfile,
  // login,
  createMerchantShop,
  updateMerchantShop,
  getMerchantShop,
};
 