import { Router } from "express";
import { deleteProduct, getAllProducts, getProductById, newProductItem, updateProduct } from "../../controllers/product-controllers";
import { verifyJWT } from "../../middlewares/verify-jwt";
const router = Router();

router.get("/", verifyJWT, getAllProducts);
router.get("/:productId", verifyJWT, getProductById);
router.post("/", verifyJWT, newProductItem);
router.put("/:productId", verifyJWT, updateProduct);
router.delete("/:productId", verifyJWT, deleteProduct);

export default router;