import { AuthEmailProducer } from "../../../../src/mq/producers/auth.producer";
import { initRabbitMQ } from "../../../../src/mq/rabbitmq";
import { Channel } from "amqplib";

// Mock initRabbitMQ
jest.mock("../../../../src/mq/rabbitmq", () => ({
  initRabbitMQ: jest.fn(),
}));

// Create mock channel
const mockChannel: jest.Mocked<Channel> = {
  assertExchange: jest.fn(),
  assertQueue: jest.fn(),
  bindQueue: jest.fn(),
  publish: jest.fn(),
  // add other methods if needed, default no-op
} as any;

describe("AuthEmailProducer", () => {
  let producer: AuthEmailProducer;

  beforeEach(async () => {
    jest.clearAllMocks();
    (initRabbitMQ as jest.Mock).mockResolvedValue(mockChannel);
    producer = new AuthEmailProducer();
    await producer.init();
  });

  const emailData = {
    to: "test@example.com",
    subject: "Welcome",
    data: { name: "Harsh" },
    retry: 0,
  };

  describe("QueueVerificationEmail", () => {
    it("should publish verification email to queue", async () => {
      await producer.QueueVerificationEmail(emailData);

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        "auth_mail_exchange",
        "direct",
        { durable: true }
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        "verification_email_queue",
        { durable: true }
      );
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        "verification_email_queue",
        "auth_mail_exchange",
        "send_verification_email_to_user"
      );
      expect(mockChannel.publish).toHaveBeenCalledWith(
        "auth_mail_exchange",
        "send_verification_email_to_user",
        expect.any(Buffer),
        { persistent: true }
      );

      const bufferArg = (mockChannel.publish as jest.Mock).mock.calls[0][2];
      expect(JSON.parse(bufferArg.toString())).toEqual(emailData);
    });

    it("should throw error if init was not called", async () => {
      const newProducer = new AuthEmailProducer(); // not initialized
      await expect(
        newProducer.QueueVerificationEmail(emailData)
      ).rejects.toThrow("AuthEmailProducer not initialized");
    });
  });

  describe("QueueAccessEmail", () => {
    it("should publish access email to queue", async () => {
      await producer.QueueAccessEmail(emailData);

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        "auth_mail_exchange",
        "direct",
        { durable: true }
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        "access_email_queue",
        {
          durable: true,
        }
      );
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        "access_email_queue",
        "auth_mail_exchange",
        "send_access_email_to_user"
      );
      expect(mockChannel.publish).toHaveBeenCalledWith(
        "auth_mail_exchange",
        "send_access_email_to_user",
        expect.any(Buffer),
        { persistent: true }
      );

      const bufferArg = (mockChannel.publish as jest.Mock).mock.calls[0][2];
      expect(JSON.parse(bufferArg.toString())).toEqual(emailData);
    });

    it("should throw error if init was not called", async () => {
      const newProducer = new AuthEmailProducer(); // not initialized
      await expect(newProducer.QueueAccessEmail(emailData)).rejects.toThrow(
        "AuthEmailProducer not initialized"
      );
    });
  });
});
