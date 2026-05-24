
import { Router } from "express";
import { USER_ROLE } from "../user/user.constant";
import upload from "../../middleware/fileUpload";
import auth from "../../middleware/auth.middleware";
import { eventController } from "./event.controller";



const router = Router();



// ── File fields config ────────────────────────────────────────────
const eventFileFields = upload.fields([
  { name: 'coverImage', maxCount: 1  },
  { name: 'gallery',    maxCount: 10 },
]);
 
// ── Public routes ─────────────────────────────────────────────────
router.get('/',    eventController.getAllEvents);   // ?businessID=&isPast=&page=&limit=
router.get('/:id', eventController.getEventById);
 
// ── Protected routes (auth middleware লাগাবেন) ───────────────────
// router.use(auth)
 
router.get('/my/all', eventController.getMyEvents);
 
router.post('/create-event',auth(USER_ROLE.USER), eventFileFields,eventController.createEvent);
 
router.patch('/:id',eventFileFields,eventController.updateEvent);
 
router.post('/promotion',  eventController.addEventPromotion);
router.patch('/:id/mark-past', eventController.markEventAsPast);
router.delete('/:id',          eventController.deleteEvent);

export const eventRoutes = router;