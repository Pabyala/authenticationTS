import { Router } from "express";
import { getAllProducts, newProductItem } from "../../controllers/product-controllers";
import { verifyJWT } from "../../middlewares/verify-jwt";
const router = Router();

router.get("/all", verifyJWT, getAllProducts);
router.post("/new", verifyJWT, newProductItem);

export default router;