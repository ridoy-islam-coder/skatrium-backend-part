



// order.routes.ts
// ✅ সঠিক সিনট্যাক্স
import { Router } from "express";
import express from "express";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middleware/auth.middleware";
import { orderController } from "./userOrder.controller";
import upload from "../../middleware/fileUpload";


 
const router = Router();
 

// ─── ১. STRIPE WEBHOOK ROUTE (অবশ্যই auth ছাড়া এবং সবার উপরে থাকবে) ───
// নোট: স্ট্রাইপ ওয়েব হুকের বডি ভেরিফাই করার জন্য express.raw() প্রয়োজন হয়।
// আপনার কন্ট্রোলারে যদি stripeWebhook মেথডটি হ্যান্ডেল করা থাকে, তবে এটি অন করুন।
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  orderController.stripeWebhook // কন্ট্রোলারে এই মেথডটি ম্যাপ করে দেবেন
);
 
// POST /orders — cart theke order create + stripe payment intent   upload.single('file'),
router.post("/create-orders", auth(USER_ROLE.USER),  orderController.createOrder);
 
// GET /orders — order history
router.get("/order-history", auth(USER_ROLE.USER), orderController.getOrderHistory);
 
// GET /orders/:id — single order details
router.get("/order-details/:id", auth(USER_ROLE.USER), orderController.getOrderDetails);

 // ✅ Success & Cancel pages — auth ছাড়া (browser redirect)
router.get("/success", orderController.orderSuccessPage);

router.get("/cancel", orderController.orderCancelPage);

// ✅ Admin only
router.patch("/status/:orderId", auth(USER_ROLE.USER,USER_ROLE.OWNER), orderController.updateOrderStatus);


router.get("/myproduct-orders",auth(USER_ROLE.OWNER),orderController.getMyProductOrders);


export const orderRoutes = router;