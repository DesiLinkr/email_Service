import { Channel } from "amqplib";
import { initRabbitMQ } from "../rabbitmq";

interface ReportEmailData {
  to: string;
  subject: string;
  data: object;
  createdAt: Date;
  retry: number;
}

export class ReportsEmailProducer {
  private readonly exchange: string = "reports_mail_exchange";
  private channel!: Channel;

  async init() {
    this.channel = await initRabbitMQ();
    const routing_reports_email = "report_email_queue_to_user";

    await this.channel.assertExchange(this.exchange, "direct", {
      durable: true,
    });

    await this.channel.assertQueue("reports_email_queue", { durable: true });

    await this.channel.bindQueue(
      "reports_email_queue",
      this.exchange,
      routing_reports_email
    );
  }
  QueueReports = (ReportsData: ReportEmailData[]) => {
    if (!this.channel) throw new Error("ReportsEmailProducer not initialized");
    const sorted = ReportsData.sort(
      (a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    for (const email of sorted) {
      this.channel.publish(
        this.exchange,
        "send_report_email",
        Buffer.from(JSON.stringify(email)),
        { persistent: true }
      );
      console.log(`📨 [Report] Queued report for ${email.to}`);
    }
  };

  QueueReport = (ReportsData: ReportEmailData) => {
    if (!this.channel) throw new Error("ReportsEmailProducer not initialized");

    this.channel.publish(
      this.exchange,
      "send_report_email",
      Buffer.from(JSON.stringify(ReportsData)),
      { persistent: true }
    );
    console.log(`📨 [Report] Queued report for ${ReportsData.to}`);
  };
}
