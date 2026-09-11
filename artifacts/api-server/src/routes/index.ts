import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(authRouter);

export default router;
