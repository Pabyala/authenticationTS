import { Router } from "express";
import { refresh, signIn, signUp, verifyEmail } from "../../controllers/auth-controller";
const router = Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/verify-email", verifyEmail);
router.get("/refresh-token", refresh);

export default router;