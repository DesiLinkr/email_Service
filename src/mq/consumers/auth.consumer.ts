import { Channel, ConsumeMessage } from "amqplib";
import { initRabbitMQ } from "../rabbitmq";
import { AuthEmailProducer } from "../producers/auth.producer";
import { EmailService } from "../../services/email.service";
import { FailEmailLogsRepository } from "../../repositories/failEmailLogs.repository";
interface EmailData {
  to: string;
  subject: string;
  data: object;
  retry: number;
}

export class AuthEmailConsumer {
  private channel!: Channel;
  private failemailLogsRepo: FailEmailLogsRepository;

  private authEmailProducer: AuthEmailProducer;
  private emailService: EmailService;

  constructor(
    authEmailProducer?: AuthEmailProducer,
    emailService?: EmailService,
    failemailLogsRepo?: FailEmailLogsRepository
  ) {
    this.authEmailProducer = authEmailProducer ?? new AuthEmailProducer();
    this.emailService = emailService ?? new EmailService();
    this.failemailLogsRepo = failemailLogsRepo ?? new FailEmailLogsRepository();
  }
  async init() {
    await this.authEmailProducer.init();
    this.channel = await initRabbitMQ();
  }
  public ConsumeVerificationEmail = async () => {
    await this.channel.assertQueue("verification_email_queue", {
      durable: true,
    });
    await this.channel.consume(
      "verification_email_queue",
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        const emailData: EmailData = JSON.parse(msg.content.toString());

        try {
          await this.emailService.sendEmail(
            emailData.to,
            emailData.subject,
            "Verification",
            emailData.data
          );
        } catch (error: any) {
          console.log("Email send failed:", error);

          const retry = emailData.retry + 1;

          if (retry <= 3) {
            console.log(
              `Requeuing email for ${emailData.to}, retry attempt ${retry}`
            );

            await this.authEmailProducer.QueueVerificationEmail({
              ...emailData,
              retry,
            });
          } else {
            try {
              await this.failemailLogsRepo.createLog(
                emailData.to,
                emailData.subject,
                "Verification",
                emailData.data,
                error.message
              );
            } catch (error) {
              console.log(`unable to store log in database`);
            }
            console.log(
              `Max retries reached for ${emailData.to}, moving to dead-letter or logging`
            );
          }
        }

        this.channel.ack(msg);
      }
    );
  };
  public ConsumeueueAccessEmail = async () => {
    await this.channel.assertQueue("access_email_queue", {
      durable: true,
    });
    await this.channel.consume(
      "access_email_queue",
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        const emailData = JSON.parse(msg.content.toString());
        try {
          await this.emailService.sendEmail(
            emailData.to,
            emailData.subject,
            "access",
            emailData.data
          );
        } catch (error: any) {
          console.error("Email send failed:", error);

          const retry = emailData.retry + 1;

          if (retry <= 3) {
            console.log(
              `Requeuing email for ${emailData.to}, retry attempt ${retry}`
            );

            await this.authEmailProducer.QueueAccessEmail({
              ...emailData,
              retry,
            });
          } else {
            try {
              await this.failemailLogsRepo.createLog(
                emailData.to,
                emailData.subject,
                "access",
                emailData.data,
                error.message
              );
            } catch (error) {
              console.log(`unable to store log in database`);
            }
            console.error(
              `Max retries reached for ${emailData.to}, moving to dead-letter or logging`
            );
          }
        }
        this.channel.ack(msg);
      }
    );
  };
  public ConsumeueueforgotPassword = async () => {
    await this.channel.assertQueue("forgotPassword_email_queue", {
      durable: true,
    });
    await this.channel.consume(
      "forgotPassword_email_queue",
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        const forgotPasswordEmail = JSON.parse(msg.content.toString());
        try {
          await this.emailService.sendEmail(
            forgotPasswordEmail.to,
            forgotPasswordEmail.subject,
            "forgotPassword",
            forgotPasswordEmail.data
          );
        } catch (error: any) {
          console.error("Email send failed:", error);

          const retry = forgotPasswordEmail.retry + 1;

          if (retry <= 3) {
            console.log(
              `Requeuing email for ${forgotPasswordEmail.to}, retry attempt ${retry}`
            );

            await this.authEmailProducer.QueueforgotPasswordEmail({
              ...forgotPasswordEmail,
              retry,
            });
          } else {
            try {
              await this.failemailLogsRepo.createLog(
                forgotPasswordEmail.to,
                forgotPasswordEmail.subject,
                "forgotPassword",
                forgotPasswordEmail.data,
                error.message
              );
            } catch (error) {
              console.log(`unable to store log in database`);
            }
            console.error(
              `Max retries reached for ${forgotPasswordEmail.to}, moving to dead-letter or logging`
            );
          }
        }
        this.channel.ack(msg);
      }
    );
  };
}
