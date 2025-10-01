import { EmailServer } from "../generated/email";
import { AuthHandlers } from "../handlers/auth.handlers";
import { ReportsHandlers } from "../handlers/reports.handler";

const authHandlers = new AuthHandlers();
const reportHandlers = new ReportsHandlers();
export const emailService: EmailServer = {
  sendReports: reportHandlers.sendReports,
  sendAcesssEmail: authHandlers.sendAcesssEmail,
  sendVerificationEmail: authHandlers.sendVerificationEmail,
};
