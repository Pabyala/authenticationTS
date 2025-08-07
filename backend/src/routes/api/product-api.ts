import { Router } from "express";
import { getAllProducts, newProductItem, updateProduct } from "../../controllers/product-controllers";
import { verifyJWT } from "../../middlewares/verify-jwt";
const router = Router();

router.get("/all", getAllProducts);
router.post("/new", verifyJWT, newProductItem);
router.put("/update/:productId", verifyJWT, updateProduct);

export default router;