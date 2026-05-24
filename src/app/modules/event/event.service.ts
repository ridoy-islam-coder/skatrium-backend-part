import { Request } from "express";
import { deleteFromS3, deleteManyFromS3, uploadManyToS3, uploadToS3 } from "../../utils/fileHelper";

import { IEventDocument } from "./event.interface";
import mongoose from "mongoose";
import { Event  } from "./event.model";


























//new api export




// ✅ Get All Events (public — browse screen)
export const getAllEventsService = async (req: Request) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const filter: any = {};

  // businessID দিয়ে filter
  if (req.query.businessID) {
    filter.businessID = req.query.businessID;
  }

  // isPast filter (আসছে events নাকি পুরনো)
  if (req.query.isPast !== undefined) {
    filter.isPast = req.query.isPast === 'true';
  }

  const [data, total] = await Promise.all([
    Event.find(filter)
      .populate('businessID', 'business_name business_image location')
      .populate('host', 'fullName image')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

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

// ✅ Get My Events (host এর events)
export const getMyEventsService = async (req: Request) => {
  const userId = req.user?.id;
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 10;
  const skip   = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Event.find({ host: userId })
      .populate('businessID', 'business_name business_image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments({ host: userId }),
  ]);

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

// ✅ Get Single Event
export const getEventByIdService = async (req: Request): Promise<IEventDocument> => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate('businessID', 'business_name business_image location')
    .populate('host', 'fullName image');

  if (!event) throw new Error('Event not found');

  return event;
};

export const createEventService = async (req: Request): Promise<IEventDocument> => {
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };
 
  const {
    businessID,
    eventtitle,
    eventsubtitle,
    date,
    time,
    description,
  } = req.body;
 
  // ── Active event খোঁজো — isPast: false ─────────────────────────
  // একটা businessID তে একটাই active event থাকবে
  const activeEvent = await Event.findOne({
    businessID,   // plain string — DB তে string হিসেবে save আছে
    isPast: false,
  }) as IEventDocument | null;
 
  // ── Cover image ───────────────────────────────────────────────
  let coverImage = activeEvent?.coverImage ?? { id: '', url: '' };
  if (files?.coverImage?.[0]) {
    if (activeEvent?.coverImage?.id) await deleteFromS3(activeEvent.coverImage.id);
    const uploaded = await uploadToS3(files.coverImage[0], 'event/cover');
    coverImage     = { id: uploaded.id, url: uploaded.url };
  }
 
  // ── Gallery ───────────────────────────────────────────────────
  let gallery = activeEvent?.gallery ?? [];
  if (files?.gallery?.length) {
    const oldKeys = (activeEvent?.gallery ?? []).map((g) => g.id).filter(Boolean);
    if (oldKeys.length) await deleteManyFromS3(oldKeys);
    const uploaded = await uploadManyToS3(
      files.gallery.map((file) => ({ file, path: 'event/gallery' }))
    );
    gallery = uploaded.map((g) => ({ id: g.id, url: g.url }));
  }
 
  let event: IEventDocument;
 
  if (activeEvent) {
    // ── isPast: false → existing event UPDATE ─────────────────
    const updated = await Event.findByIdAndUpdate(
      activeEvent._id,
      {
        eventtitle,
        eventsubtitle,
        date,
        time,
        description,
        coverImage,
        gallery,
      },
      { new: true, runValidators: true }
    ).populate('businessID', 'business_name business_image') as IEventDocument;
 
    event = updated;
  } else {
    // ── isPast: true (কোনো active event নেই) → নতুন CREATE ────
    event = await Event.create({
      businessID,
      eventtitle,
      eventsubtitle,
      description,
      host: userId,
      coverImage,
      gallery,
      isPast: false,
    }) as IEventDocument;
  }
 
  return event;
};


// ✅ Update Event
export const updateEventService = async (req: Request): Promise<IEventDocument> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };

  const existing = await Event.findOne({ _id: id, host: userId });
  if (!existing) throw new Error('Event not found or unauthorized');

  // ── Cover image update ────────────────────────────────────────
  let coverImage = existing.coverImage;
  if (files?.coverImage?.[0]) {
    if (existing.coverImage?.id) await deleteFromS3(existing.coverImage.id); // পুরনো delete
    const uploaded = await uploadToS3(files.coverImage[0], 'event/cover');
    coverImage     = { id: uploaded.id, url: uploaded.url };
  }

  // ── Gallery update ────────────────────────────────────────────
  let gallery = existing.gallery;
  if (files?.gallery?.length) {
    const oldKeys = existing.gallery.map((g) => g.id).filter(Boolean);
    if (oldKeys.length) await deleteManyFromS3(oldKeys); // পুরনো সব delete
    const uploaded = await uploadManyToS3(
      files.gallery.map((file) => ({ file, path: 'event/gallery' }))
    );
    gallery = uploaded.map((g) => ({ id: g.id, url: g.url }));
  }

  const event = await Event.findByIdAndUpdate(
    id,
    { ...req.body, coverImage, gallery },
    { new: true, runValidators: true }
  ).populate('businessID', 'business_name business_image');

  if (!event) throw new Error('Event not found');

  return event;
};

// ✅ Upsert Promotion — event না থাকলে create, promotion থাকলে update নাহলে add
export const addEventPromotionService = async (req: Request): Promise<IEventDocument> => {
  const userId = req.user?.id;
 
  const {
    businessID,
    title,
    description,
    discount_percentage,
    last_date,
    lest_time,
  } = req.body;
 
  if (!title) throw new Error('Promotion title is required');
 
  // ── active event খোঁজো ───────────────────────────────────────
  let event = await Event.findOne({
    businessID,
    isPast: false,
  }) as IEventDocument | null;
 
  // ── event না থাকলে businessID + userId দিয়ে নতুন create ──────
  if (!event) {
    event = await Event.create({
      businessID,
      host:   userId,
      isPast: false,
    }) as IEventDocument;
  }
 
  // ── same title এর promotion আগে আছে কিনা check ───────────────
  const existingIndex = event.promotions.findIndex(
    (p) => p.title === title
  );
 
  if (existingIndex !== -1) {
    // ── আছে → update করো ────────────────────────────────────
    event.promotions[existingIndex] = {
      title,
      description,
      discount_percentage,
      last_date,
      lest_time,
    };
  } else {
    // ── নেই → নতুন add করো ──────────────────────────────────
    event.promotions.push({
      title,
      description,
      discount_percentage,
      last_date,
      lest_time,
    });
  }
 
  await event.save();
 
  return event;
};




// ✅ Mark Event as Past
export const markEventAsPastService = async (req: Request): Promise<IEventDocument> => {
  const { id } = req.params;
  const userId = req.user?.id;

  const event = await Event.findOneAndUpdate(
    { _id: id, host: userId },
    { isPast: true },
    { new: true }
  );

  if (!event) throw new Error('Event not found or unauthorized');

  return event;
};

// ✅ Soft Delete Event
export const deleteEventService = async (req: Request): Promise<IEventDocument> => {
  const { id } = req.params;
  const userId = req.user?.id;

  const event = await Event.findOne({ _id: id, host: userId });
  if (!event) throw new Error('Event not found or unauthorized');

  // S3 files delete
  const keysToDelete = [
    event.coverImage?.id,
    ...event.gallery.map((g) => g.id),
  ].filter(Boolean) as string[];

  if (keysToDelete.length) await deleteManyFromS3(keysToDelete);

  // Soft delete (model এর pre hook এ isDeleted filter আছে)
  event.isDeleted = true;
  await event.save();

  return event;
};



export const eventServices = {
  getAllEventsService,
  getMyEventsService,
  getEventByIdService,
  createEventService,
  updateEventService,
  addEventPromotionService,
  markEventAsPastService,
  deleteEventService,
};