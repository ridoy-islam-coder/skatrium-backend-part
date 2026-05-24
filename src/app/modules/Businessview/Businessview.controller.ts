

// ═══════════════════════════════════════════════════════════════════
//  Get Analytics Dashboard

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { analyticsServices } from "./Businessview.service";

// ═══════════════════════════════════════════════════════════════════
export const getAnalytics = catchAsync(async (req, res) => {
  const result = await analyticsServices.getAnalyticsService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Analytics data fetched successfully',
    data:       result,
  });
});

// ═══════════════════════════════════════════════════════════════════
//  Track Business View  ← business details controller e add korbo
// ═══════════════════════════════════════════════════════════════════
export const trackView = catchAsync(async (req, res, next) => {
  const { id } = req.params;          // business id
  const viewerId = req.user?.id;

  if (viewerId) {
    await analyticsServices.trackBusinessViewService(id as string, viewerId);
  }

  next(); 
});

export const BusinessViewcontroller = {
  getAnalytics,
  trackView,
};