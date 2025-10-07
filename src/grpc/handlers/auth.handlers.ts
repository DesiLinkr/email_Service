import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { AuthEmailProducer } from "../../mq/producers/auth.producer";
import { validate } from "../../utils/validate";
import { AuthEmailValidation } from "../../validations/auth.validation";
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

      const request = validate(
        AuthEmailValidation.VerificationEmail,
        call.request
      );

      await this.authEmailProducer.QueueVerificationEmail(request as any);

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
      const request = validate(AuthEmailValidation.AccessEmail, call.request);
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueAccessEmail(request as any);

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
      const request = validate(
        AuthEmailValidation.forgotPassword,
        call.request
      );

      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueforgotPasswordEmail(request as any);

      callback(null, { msg: "Email sent successfully" });
    } catch (error: any) {
      callback(error, null);
    }
  };
}
