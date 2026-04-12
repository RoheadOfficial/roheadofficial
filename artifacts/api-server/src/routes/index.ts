import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roheadRouter from "./rohead";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roheadRouter);

export default router;
