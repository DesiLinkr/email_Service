import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { AuthEmailProducer } from "../../mq/producers/auth.producer";
import { validate } from "../../utils/validate";
import { ReportsValidation } from "../../validations/reports";
import { emailServiceResponse, Reports } from "../generated/email";

export class ReportsHandlers {
  private readonly authEmailProducer: AuthEmailProducer;

  constructor() {
    this.authEmailProducer = new AuthEmailProducer();
  }
  public sendReports = async (
    call: ServerUnaryCall<Reports, emailServiceResponse>,
    callback: sendUnaryData<emailServiceResponse>
  ) => {
    try {
      await this.authEmailProducer.init();
      const request: any = call.request;
      validate(ReportsValidation.Reports, request);
      await this.authEmailProducer.QueueVerificationEmail(request.Reports);
      callback(null, { msg: "Email sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };
}
