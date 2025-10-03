import { Channel } from "amqplib";
import { initRabbitMQ } from "../rabbitmq";

interface EmailData {
  to: string;
  subject: string;
  data: object;
  retry: Number;
}

export class AuthEmailProducer {
  private readonly exchange: string = "auth_mail_exchange";
  private channel!: Channel;

  async init() {
    this.channel = await initRabbitMQ();
  }

  QueueVerificationEmail = async (emailData: EmailData) => {
    if (!this.channel) throw new Error("AuthEmailProducer not initialized");

    const routing_verification_email = "send_verification_email_to_user";
    await this.channel.assertExchange(this.exchange, "direct", {
      durable: true,
    });
    await this.channel.assertQueue("verification_email_queue", {
      durable: true,
    });

    await this.channel.bindQueue(
      "verification_email_queue",
      this.exchange,
      routing_verification_email
    );

    this.channel.publish(
      this.exchange,
      routing_verification_email,
      Buffer.from(JSON.stringify(emailData)),
      { persistent: true }
    );
  };

  QueueAccessEmail = async (emailData: EmailData) => {
    if (!this.channel) throw new Error("AuthEmailProducer not initialized");

    const routing_access_email = "send_access_email_to_user";
    await this.channel.assertExchange(this.exchange, "direct", {
      durable: true,
    });
    await this.channel.assertQueue("access_email_queue", { durable: true });
    await this.channel.bindQueue(
      "access_email_queue",
      this.exchange,
      routing_access_email
    );
    this.channel.publish(
      this.exchange,
      routing_access_email,
      Buffer.from(JSON.stringify(emailData)),
      { persistent: true }
    );
  };
}
