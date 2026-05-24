import { Request } from "express";
import { IBusinessDocument } from "./Business.interface";
import { deleteFromS3, uploadManyToS3, uploadToS3 } from "../../utils/fileHelper";
import Business from "./Business.model";
import AppError from "../../error/AppError";
import  httpStatus  from 'http-status';
import { IEventDocument } from "../event/event.interface";
import { Event } from "../event/event.model";
import User from "../user/user.model";
import SocialLink from "../sociallink/soscial.model";
import { Category } from "../eventcatagore/eventcatagore.model";


// ✅ Create Business (Add Business Details screen)
export const createBusinessService = async (req: Request): Promise<IBusinessDocument> => {
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };

  // ── Destructure body ──────────────────────────────────────────
  const { longitude, latitude, ...restBody } = req.body; // ✅ এটা add করো

  // ── Single file uploads ───────────────────────────────────────
  let featured_image = { url: '', id: '' };
  if (files?.featured_image?.[0]) {
    featured_image = await uploadToS3(files.featured_image[0], 'business/featured');
  }

  // ── Multiple gallery images ───────────────────────────────────
  let gallery: { url: string; id: string }[] = [];
  if (files?.gallery?.length) {
    gallery = await uploadManyToS3(
      files.gallery.map((file) => ({
        file,
        path: 'business/gallery',
      }))
    );
  }

  // ── Geo location build ────────────────────────────────────────
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

  const business = await Business.create({
    host:               userId,
    ...restBody,           // ✅ req.body এর বদলে restBody use করো
    featured_image:     featured_image.url,
    featured_image_key: featured_image.id,
    gallery:            gallery.map((g) => g.url),
    gallery_keys:       gallery.map((g) => g.id),
    location:           geoLocation,
  });

  return business;
};



// ✅ Update Business Service
export const updateBusinessService = async (req: Request): Promise<IBusinessDocument> => {
  const userId = req.user?.id;
  const { id } = req.params;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const { longitude, latitude, ...restBody } = req.body;

  // ── Find existing business ────────────────────────────────────
  const existingBusiness = await Business.findOne({ _id: id, host: userId });
  if (!existingBusiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business not found or unauthorized');
  }

  // ── Featured image update ─────────────────────────────────────
  let featured_image = {
    url: existingBusiness.featured_image,
    id:  existingBusiness.featured_image_key,
  };

  if (files?.featured_image?.[0]) {
    // delete old image from S3
    if (existingBusiness.featured_image_key) {
      await deleteFromS3(existingBusiness.featured_image_key);
    }
    featured_image = await uploadToS3(files.featured_image[0], 'business/featured');
  }

  // ── Gallery update ────────────────────────────────────────────
  let gallery_urls = existingBusiness.gallery ?? [];
  let gallery_keys = existingBusiness.gallery_keys ?? [];

  if (files?.gallery?.length) {
    // delete old gallery from S3
    if (gallery_keys.length) {
      await Promise.all(gallery_keys.map((key) => deleteFromS3(key)));
    }
    const newGallery = await uploadManyToS3(
      files.gallery.map((file) => ({ file, path: 'business/gallery' }))
    );
    gallery_urls = newGallery.map((g) => g.url);
    gallery_keys = newGallery.map((g) => g.id);
  }

  // ── Geo location update ───────────────────────────────────────
  let geoLocation = existingBusiness.location;
  if (longitude && latitude) {
    geoLocation = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
  }

  // ── Update ────────────────────────────────────────────────────
  const updated = await Business.findByIdAndUpdate(
    id,
    {
      ...restBody,
      featured_image:     featured_image.url,
      featured_image_key: featured_image.id,
      gallery:            gallery_urls,
      gallery_keys:       gallery_keys,
      location:           geoLocation,
    },
    { new: true, runValidators: true }
  );

  return updated!;
};

// ═══════════════════════════════════════════════════════════════════
//  Delete Business Service
// ═══════════════════════════════════════════════════════════════════
export const deleteBusinessService = async (req: Request): Promise<void> => {
  const userId = req.user?.id;
  const { id }  = req.params;
 
  // ── Find existing business ────────────────────────────────────
  const business = await Business.findOne({ _id: id, host: userId });
  if (!business) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business not found or unauthorized');
  }
 
  // ── Delete featured image from S3 ─────────────────────────────
  if (business.featured_image_key) {
    await deleteFromS3(business.featured_image_key);
  }
 
  // ── Delete gallery images from S3 ─────────────────────────────
  if (business.gallery_keys?.length) {
    await Promise.all(business.gallery_keys.map((key) => deleteFromS3(key)));
  }
 
  // ── Soft delete (recommended) ─────────────────────────────────
  await Business.findByIdAndDelete(id);
};




export const getMyBusinessesService = async (req: Request) => {
  const userId = req.user?.id;
 
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip  = (page - 1) * limit;
 
  const [businesses, total] = await Promise.all([
    Business.find({ host: userId })
      .populate('business_category',     'name')
      .populate('business_sub_category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
 
    Business.countDocuments({ host: userId }),
  ]);
 
  return {
     data: businesses,
      pagination: {
      total:       total,
      page:        page,
      limit:       limit,
      totalPage:   Math.ceil(total / limit),  // totalPages → totalPage
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
  }
  };
};



export const getBusinessDetailsService = async (req: Request) => {
  const { id } = req.params;
 
  const business = await Business.findById(id)
    .populate('host',                  'name email profileImage')
    .populate('business_category',     'name')
    .populate('business_sub_category', 'name')
    .populate('reviews.user',          'name profileImage');
 
  if (!business) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business not found');
  }
 
  return business;
};





// ✅ Get Active Event by BusinessID — isPast: false event এর data আসবে
export const getActiveEventByBusinessService = async (req: Request): Promise<IEventDocument> => {
  const { businessID } = req.body;
 
  const event = await Event.findOne({ businessID, isPast: false })
    .populate('businessID', 'business_name business_image location')
    .populate('host', 'fullName image') as IEventDocument | null;
 
  if (!event) throw new Error('No active event found for this business');
 
  return event;
};


// ✅ Get Home Page Data
// ✅ Get Home Page Data
export const getHomePageService = async (req: Request) => {
  const userId = req.user?.id;

  // ── User info ─────────────────────────────────────────────────
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found');

  // ── SocialLink with populate ──────────────────────────────────
  const socialLinkRaw = await SocialLink.findOne({ user: userId })
    .populate('Buisness_Category',    'name slug image_url')
    .populate('businesssub_category', 'name slug');

  // ── Total category count ──────────────────────────────────────
  const totalCategoryCount = await Category.countDocuments({ isActive: true });

  // ── Businesses by sub-category ────────────────────────────────
  let businesses: any[] = [];
  if (socialLinkRaw?.businesssub_category) {
    businesses = await Business.find({
      business_sub_category: socialLinkRaw.businesssub_category,
      is_active: true,
    })
      .populate('business_category',     'name slug')
      .populate('business_sub_category', 'name slug')
      .populate('host',                  'fullName image')
      .sort({ plan: -1, average_rating: -1 })
      .limit(10);
  }

  return {
    Buisness_Category:    socialLinkRaw?.Buisness_Category    ?? null,
    businesssub_category: socialLinkRaw?.businesssub_category ?? null,
    Buisness_owner_Type:  socialLinkRaw?.Buisness_owner_Type  ?? null,
    Buisness_Type:        socialLinkRaw?.Buisness_Type        ?? null,
    totalCategoryCount,
    businesses,
  };
};





// ═══════════════════════════════════════════════════════════════════
//  Update Business Category Service
// ═══════════════════════════════════════════════════════════════════
export const updateBusinessCategoryService = async (req: Request) => {
  const userId = req.user?.id;

  const {
    Buisness_Category,
    businesssub_category,
    Second_BuisnessCategory,
    Second_BusinessSubCategory,
  } = req.body;

  const updated = await SocialLink.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        Buisness_Category,
        businesssub_category,
        Second_BuisnessCategory,
        Second_BusinessSubCategory,
      },
    },
    { new: true, runValidators: true }
  )
    .populate('Buisness_Category',         'name slug')
    .populate('businesssub_category',      'name slug')
    .populate('Second_BuisnessCategory',   'name slug')
    .populate('Second_BusinessSubCategory','name slug');

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'SocialLink not found');
  }

  return {
    Buisness_Category:          updated.Buisness_Category,
    businesssub_category:       updated.businesssub_category,
    Second_BuisnessCategory:    updated.Second_BuisnessCategory,
    Second_BusinessSubCategory: updated.Second_BusinessSubCategory,
  };
};






export const businessServices={
  createBusinessService,
  updateBusinessService,
  deleteBusinessService,
  getMyBusinessesService,
getBusinessDetailsService,
getActiveEventByBusinessService,
getHomePageService,
updateBusinessCategoryService,
}