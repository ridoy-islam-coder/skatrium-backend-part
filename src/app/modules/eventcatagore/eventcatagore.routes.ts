import { Router } from "express";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middleware/auth.middleware";
import { categoryController } from "./eventcatagore.controller";
import upload from "../../middleware/fileUpload";


 
const router = Router();
 

router.get("/allcategories-event",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.getAllCategories);

router.post("/categories-event",auth(USER_ROLE.USER,USER_ROLE.admin), upload.single('image'), categoryController.createCategory);

router.get("/details/:id",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.getCategoryById);

router.patch("/update/:id",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.updateCategory);

router.delete("/delete/:id",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.deleteCategory);


//newapi

router.get("/getAllCategories",  categoryController.getAllCategories);

router.get("/details/:id",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.getCategoryByIdnew);

router.get("/events",auth(USER_ROLE.USER,USER_ROLE.admin), categoryController.getEventsByCategoryId);



// user er jonno

// # সব একসাথে
// GET /categories?search=music&isActive=true&isPopular=true&page=1&limit=10
router.get("/user/getAllCategories", categoryController.getAllCategories);
 
export const catagoreeventRoutes = router;