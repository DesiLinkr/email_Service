import { Router } from "express";
import emailRouter from "./email.routes";
import healthRouter from "./health.route";

const routes = Router();
routes.use("/email", emailRouter);

routes.use("/health", healthRouter);
export default routes;
