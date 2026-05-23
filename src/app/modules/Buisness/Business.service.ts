import { Request } from "express";
import { IBusinessDocument } from "./Business.interface";
import { uploadManyToS3, uploadToS3 } from "../../utils/fileHelper";
import Business from "./Business.model";



// ✅ Create Business (Add Business Details screen)
export const createBusinessService = async (req: Request): Promise<IBusinessDocument> => {
  const userId = req.user?.id;
  const files  = req.files as { [fieldname: string]: Express.Multer.File[] };
 
  // ── Single file uploads ───────────────────────────────────────
  let featured_image   = { url: '', id: '' };
  let business_logo    = { url: '', id: '' };
  let business_image   = { url: '', id: '' };
 
  if (files?.featured_image?.[0]) {
    featured_image = await uploadToS3(files.featured_image[0], 'business/featured');
  }
  if (files?.business_logo?.[0]) {
    business_logo = await uploadToS3(files.business_logo[0], 'business/logo');
  }
  if (files?.business_image?.[0]) {
    business_image = await uploadToS3(files.business_image[0], 'business/cover');
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
 
  const business = await Business.create({
    host:               userId,
    ...req.body,
    featured_image:     featured_image.url,
    featured_image_key: featured_image.id,
    business_logo:      business_logo.url,
    business_logo_key:  business_logo.id,
    business_image:     business_image.url,
    business_image_key: business_image.id,
    gallery:            gallery.map((g) => g.url),
    gallery_keys:       gallery.map((g) => g.id),
    location:           req.body.location,
  });
 
  return business;
};







export const businessServices={
  createBusinessService,
}