import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { AuthEmailProducer } from "../../mq/producers/auth.producer";
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
      await this.authEmailProducer.QueueVerificationEmail(request.Reports);
      callback(null, { msg: "Emails sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };
}
