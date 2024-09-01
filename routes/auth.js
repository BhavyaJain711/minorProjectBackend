import { Router } from "express";
import { registerStudent, login } from "../controllers/auth.js";

const router = Router();

router.post('/',registerStudent)
router.post('/login',login)

export default router;