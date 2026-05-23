import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { businessServices } from "./Business.service";


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






export const businessController = {
  createBusiness,
}