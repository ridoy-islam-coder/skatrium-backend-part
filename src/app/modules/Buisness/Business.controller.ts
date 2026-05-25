import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { businessServices, getBusinessReviewsService } from "./Business.service";
import  httpStatus  from 'http-status';



// ✅ Create Business (Add Business Details screen)
export const createBusiness = catchAsync(async (req, res) => {
  const result = await businessServices.createBusinessService(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Business created successfully',
    data: result,
  });
});


// ✅ Update Business
export const updateBusiness = catchAsync(async (req, res) => {
  const result = await businessServices.updateBusinessService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Business updated successfully',
    data: result,
  });
});


export const deleteBusiness = catchAsync(async (req, res) => {
  await businessServices.deleteBusinessService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Business deleted successfully',
    data: null,
  });
});


export const getMyBusinesses = catchAsync(async (req, res) => {
  const result = await businessServices.getMyBusinessesService(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My businesses fetched successfully',
    data:     result.data,
    meta:     result.pagination,
  });
});
 
export const getBusinessDetails = catchAsync(async (req, res) => {
  const result = await businessServices.getBusinessDetailsService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Business details fetched successfully',
    data:       result,
  });
});







// ✅ Get Active Event by BusinessID
export const getActiveEventByBusiness = catchAsync(async (req, res) => {
  const result = await businessServices.getActiveEventByBusinessService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Active event fetched successfully',
    data:       result,
  });
});


// ✅ Get Home Page Data
export const getHomePage = catchAsync(async (req, res) => {
  const result = await businessServices.getHomePageService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Home page data fetched successfully',
    data:       result,
  });
});
 






export const updateBusinessCategory = catchAsync(async (req, res) => {
  const result = await businessServices.updateBusinessCategoryService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Business category updated successfully',
    data:       result,
  });
});

export const getAllBusinesses = catchAsync(async (req, res) => {
  const result = await businessServices.getAllBusinessesService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'All businesses fetched successfully',
    data:       result.data,
    meta:       result.pagination,
  });
});



// business.controller.ts

export const getBusinessReviews = catchAsync(async (req, res) => {
  const result = await getBusinessReviewsService(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success:    true,
    message:    'Business reviews fetched successfully',
     data:       result.reviews,
    meta: result.pagination,            // ✅ শুধু pagination
  });
});






const getBusinessByUser = catchAsync(async (req, res) => {
  const userId = req.params.userId;

  const result = await businessServices.getBusinessByUserId(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Businesses fetched successfully',
    data: result,
  });
});

export const businessController = {
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getMyBusinesses,
  getBusinessDetails,
  getActiveEventByBusiness,
  getHomePage,
  updateBusinessCategory,
  getAllBusinesses,
  getBusinessReviews,
  getBusinessByUser
}
