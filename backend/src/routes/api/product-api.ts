import { Router } from "express";
import { deleteProduct, getAllProducts, newProductItem, updateProduct } from "../../controllers/product-controllers";
import { verifyJWT } from "../../middlewares/verify-jwt";
const router = Router();

router.get("/all", verifyJWT, getAllProducts);
router.post("/new", verifyJWT, newProductItem);
router.put("/update/:productId", verifyJWT, updateProduct);
router.delete("/delete/:productId", verifyJWT, deleteProduct);

export default router;