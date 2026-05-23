import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { eventServices } from "./event.service";


// ✅ Get All Events
export const getAllEvents = catchAsync(async (req, res) => {
  const result = await eventServices.getAllEventsService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Events fetched successfully',
    data:       result.data,
    meta:       result.pagination,
  });
});

// ✅ Get My Events
export const getMyEvents = catchAsync(async (req, res) => {
  const result = await eventServices.getMyEventsService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'My events fetched successfully',
    data:       result.data,
    meta:       result.pagination,
  });
});

// ✅ Get Single Event
export const getEventById = catchAsync(async (req, res) => {
  const result = await eventServices.getEventByIdService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Event fetched successfully',
    data:       result,
  });
});

// ✅ Create Event
export const createEvent = catchAsync(async (req, res) => {
  const result = await eventServices.createEventService(req);
  sendResponse(res, {
    statusCode: 201,
    success:    true,
    message:    'Event created successfully',
    data:       result,
  });
});

// ✅ Update Event
export const updateEvent = catchAsync(async (req, res) => {
  const result = await eventServices.updateEventService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Event updated successfully',
    data:       result,
  });
});

// ✅ Add Promotion to Event
export const addEventPromotion = catchAsync(async (req, res) => {
  const result = await eventServices.addEventPromotionService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Promotion added successfully',
    data:       result,
  });
});

// ✅ Mark Event as Past
export const markEventAsPast = catchAsync(async (req, res) => {
  const result = await eventServices.markEventAsPastService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Event marked as past',
    data:       result,
  });
});

// ✅ Delete Event
export const deleteEvent = catchAsync(async (req, res) => {
  const result = await eventServices.deleteEventService(req);
  sendResponse(res, {
    statusCode: 200,
    success:    true,
    message:    'Event deleted successfully',
    data:       result,
  });
});


export const eventController = {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,

  addEventPromotion,
  markEventAsPast,
  deleteEvent,
}