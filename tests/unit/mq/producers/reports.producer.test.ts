import { ReportsEmailProducer } from "../../../../src/mq/producers/reports.producer";
import { initRabbitMQ } from "../../../../src/mq/rabbitmq";
import { Channel } from "amqplib";

jest.mock("../../../../src/mq/rabbitmq", () => ({
  initRabbitMQ: jest.fn(),
}));

// Fake channel mock
const mockChannel: jest.Mocked<Channel> = {
  assertExchange: jest.fn(),
  assertQueue: jest.fn(),
  bindQueue: jest.fn(),
  publish: jest.fn(),
} as any;

describe("ReportsEmailProducer", () => {
  let producer: ReportsEmailProducer;

  beforeEach(async () => {
    jest.clearAllMocks();
    (initRabbitMQ as jest.Mock).mockResolvedValue(mockChannel);
    producer = new ReportsEmailProducer();
    await producer.init();
  });

  const baseReport = {
    to: "test@example.com",
    subject: "Report",
    data: { stats: 123 },
    createdAt: new Date("2025-09-24T10:00:00Z"),
    retry: 0,
  };

  describe("init", () => {
    it("should setup exchange, queue and binding", async () => {
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        "reports_mail_exchange",
        "direct",
        { durable: true }
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        "reports_email_queue",
        { durable: true }
      );
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        "reports_email_queue",
        "reports_mail_exchange",
        "report_email_queue_to_user"
      );
    });
  });

  describe("QueueReport", () => {
    it("should publish a single report email", () => {
      producer.QueueReport(baseReport);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        "reports_mail_exchange",
        "send_report_email",
        expect.any(Buffer),
        { persistent: true }
      );

      const bufferArg = (mockChannel.publish as jest.Mock).mock.calls[0][2];
      const parsed = JSON.parse(bufferArg.toString());

      expect(parsed).toMatchObject({
        to: baseReport.to,
        subject: baseReport.subject,
        data: baseReport.data,
        retry: baseReport.retry,
      });

      expect(new Date(parsed.createdAt).toISOString()).toBe(
        baseReport.createdAt.toISOString()
      );
    });

    it("should throw if not initialized", () => {
      const newProducer = new ReportsEmailProducer();
      expect(() => newProducer.QueueReport(baseReport)).toThrow(
        "ReportsEmailProducer not initialized"
      );
    });
  });

  describe("QueueReports", () => {
    it("should sort reports by createdAt and publish each", () => {
      const older = {
        ...baseReport,
        to: "old@example.com",
        createdAt: new Date("2025-09-23T10:00:00Z"),
      };
      const newer = {
        ...baseReport,
        to: "new@example.com",
        createdAt: new Date("2025-09-25T10:00:00Z"),
      };

      producer.QueueReports([newer, older]); // pass unsorted

      // Ensure two publishes
      expect(mockChannel.publish).toHaveBeenCalledTimes(2);

      // Check publish order (older first)
      const firstBuffer = (mockChannel.publish as jest.Mock).mock.calls[0][2];
      const secondBuffer = (mockChannel.publish as jest.Mock).mock.calls[1][2];
      expect(JSON.parse(firstBuffer.toString()).to).toBe("old@example.com");
      expect(JSON.parse(secondBuffer.toString()).to).toBe("new@example.com");
    });

    it("should throw if not initialized", () => {
      const newProducer = new ReportsEmailProducer();
      expect(() => newProducer.QueueReports([baseReport])).toThrow(
        "ReportsEmailProducer not initialized"
      );
    });
  });
});
