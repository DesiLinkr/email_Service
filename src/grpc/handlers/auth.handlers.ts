import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { AuthEmailProducer } from "../../mq/producers/auth.producer";
import {
  AccessEmailRequest,
  emailServiceResponse,
  ForgotPasswordRequest,
  VerificationEmailRequest,
} from "../generated/email";

export class AuthHandlers {
  private readonly authEmailProducer: AuthEmailProducer;

  constructor() {
    this.authEmailProducer = new AuthEmailProducer();
  }
  public sendVerificationEmail = async (
    call: ServerUnaryCall<VerificationEmailRequest, emailServiceResponse>,
    callback: sendUnaryData<emailServiceResponse>
  ) => {
    try {
      await this.authEmailProducer.init();

      await this.authEmailProducer.QueueVerificationEmail(call.request as any);

      callback(null, { msg: "Email sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };

  public sendAcesssEmail = async (
    call: ServerUnaryCall<AccessEmailRequest, emailServiceResponse>,
    callback: sendUnaryData<emailServiceResponse>
  ) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueAccessEmail(call.request as any);

      callback(null, { msg: "Email sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };

  public sendforgotPassword = async (
    call: ServerUnaryCall<ForgotPasswordRequest, emailServiceResponse>,
    callback: sendUnaryData<emailServiceResponse>
  ) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueforgotPasswordEmail(
        call.request as any
      );

      callback(null, { msg: "Email sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };
}
