import { Router } from "express";
import { EmailController } from "../controllers/email.controller";

const emailController = new EmailController();
const emailRouter = Router();
emailRouter.post("/access", emailController.sendAcesss);
emailRouter.post("/verification", emailController.sendVerification);
emailRouter.post("/forgot-password", emailController.sendforgotPassword);
emailRouter.post("/reports", emailController.sendReports);
export default emailRouter;
