

import httpStatus from 'http-status';
import { Admin } from './admin.model';
import AppError from '../../../error/AppError';
import User from '../../user/user.model';
import { Event } from '../../event/event.model';
import { Order } from '../../userOrder/userOrder.model';

import { updatePastEvents } from '../../../utils/updatePastEvents';
import { ro } from 'date-fns/locale/ro';
import { Personalization } from '../../Personalizationuser/Personalization.model';
import SocialLink from '../../sociallink/soscial.model';

const updateAdminProfile = async (id: string, payload: Record<string, any>) => {
  console.log("Update id:", id);
  console.log("Payload:", payload);

  const allowedFields = ["fullName", "phoneNumber", "image"];
  const updateData: Record<string, any> = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

 

  const admin = await Admin.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  
  if (!admin) throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  return admin;
};




const changePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string,
) => {
  const admin = await Admin.findById(id).select('+password');
  if (!admin) throw new AppError(404, 'Admin not found');

  const isMatch = await admin.isPasswordMatched(oldPassword);
  if (!isMatch) throw new AppError(401, 'Old password incorrect');

  admin.password = newPassword;
  await admin.save();
};

const setForgotOtp = async (email: string) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new AppError(404, 'Admin not found');

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  admin.verification = { otp, expiresAt, verified: false };
  await admin.save();

  return otp;
};

const verifyOtp = async (email: string, otp: number) => {
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.verification)
    throw new AppError(404, 'OTP not generated');

  if (admin.verification.verified)
    throw new AppError(400, 'OTP already verified');

  if (Date.now() > new Date(admin.verification.expiresAt).getTime()) {
    throw new AppError(400, 'OTP expired');
  }

  if (admin.verification.otp !== otp) throw new AppError(400, 'Invalid OTP');

  admin.verification.verified = true;
  await admin.save();
};

const resetPassword = async (email: string, newPassword: string) => {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !admin.verification?.verified) {
    throw new AppError(400, 'OTP not verified');
  }

  admin.password = newPassword;
  admin.verification = undefined;
  await admin.save();
};



//admin dasbord api 




// ── Get All Users (Admin) ─────────────────────────────────────────────────────
const getAllUsers = async (
  search?: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
 
  const filter: any = { isDeleted: false, role:  "USER"};
 
  if (search && search.trim() !== "") {
    filter.$or = [
      { fullName: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }
 
  const total = await User.countDocuments(filter);
 
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("fullName country phoneNumber status accountType email image role isActive isVerified createdAt");
 
  return {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};
 
// ── Block User ────────────────────────────────────────────────────────────────
const blockUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: false } },
    { new: true }
  ).select("fullName email isActive");
 
  if (!user) throw new Error("User not found");
  return user;
};
 
// ── Unblock User ──────────────────────────────────────────────────────────────
const unblockUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: true } },
    { new: true }
  ).select("fullName email isActive");
 
  if (!user) throw new Error("User not found");
  return user;
};
 
// ── Delete User ───────────────────────────────────────────────────────────────
const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isDeleted: true } },
    { new: true }
  );
 
  if (!user) throw new Error("User not found");
  return { message: "User deleted successfully" };
};
 const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) throw new Error("User not found");

  // ✅ Personalization data — থাকলে আসবে, না থাকলে null
  const personalization = await Personalization.findOne({ user: userId });

  // ✅ SocialLink data — থাকলে আসবে, না থাকলে null
  const socialLink = await SocialLink.findOne({ user: userId });

  return {
    ...user.toObject(),
    personalization: personalization ?? null,
    socialLink: socialLink ?? null,
  };
};






export const adminService = {
  updateAdminProfile,
  changePassword,
  setForgotOtp,
  verifyOtp,
  resetPassword,
 
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getSingleUser,
};
