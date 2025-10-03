import { Channel, ConsumeMessage } from "amqplib";
import { initRabbitMQ } from "../rabbitmq";
import { ReportsEmailProducer } from "../producers/reports.producer";
import { EmailService } from "../../services/email.service";
import { FailEmailLogs } from "../../db/models/failEmailLogs.model";
import { ReportData } from "../../grpc/generated/email";
import { FailEmailLogsRepository } from "../../repositories/failEmailLogs.repository";
interface ReportEmailData {
  userId: string;
  to: string;
  subject: string;
  data: object;
  createdAt: Date;
  retry: number;
}
export class ReportsEmailConsumer {
  private channel!: Channel;
  private reportsEmailProducer: ReportsEmailProducer;
  private emailService: EmailService;
  private failemailLogsRepo: FailEmailLogsRepository;
  constructor() {
    this.emailService = new EmailService();
    this.reportsEmailProducer = new ReportsEmailProducer();
    this.failemailLogsRepo = new FailEmailLogsRepository();
  }
  async init() {
    this.channel = await initRabbitMQ();
  }

  public ConsumeReportsEmail = async (ReportEmailData: ReportEmailData) => {
    await this.channel.assertQueue("verification_email_queue", {
      durable: true,
    });

    this.channel.consume(
      "reports_email_queue",
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        const ReportsData = JSON.parse(msg.content.toString());

        try {
          await this.emailService.sendEmail(
            ReportsData.to,
            ReportsData.subject,
            "report",
            ReportsData.data
          );
        } catch (error: any) {
          console.log("Email send failed:", error);

          const retry = ReportsData.retry + 1;
          if (retry <= 3) {
            console.log(
              `Requeuing email for ${ReportsData.to}, retry attempt ${retry}`
            );

            await this.reportsEmailProducer.init();
            this.reportsEmailProducer.QueueReport({
              ...ReportEmailData,
              retry,
            });
          } else {
            try {
              await this.failemailLogsRepo.createLog(
                ReportEmailData.to,
                ReportEmailData.subject,
                "report",
                ReportEmailData.data,
                error.message
              );
            } catch (error) {
              console.log(`unable to store log in database`);
            }
            console.log(
              `Max retries reached for ${ReportsData.to}, moving to dead-letter or logging`
            );
          }
        }

        this.channel.ack(msg);
      }
    );
  };
}
