import { ReportsEmailConsumer } from "../../../../src/mq/consumers/reports.consumer";
import { authTransporter } from "../../../../src/smtp/auth.smtp";
import { Channel, ConsumeMessage } from "amqplib";

// Mock SMTP transporter
jest.mock("../../../../src/smtp/auth.smtp", () => ({
  authTransporter: { sendMail: jest.fn() },
}));

// Mock producer and fail repo
const mockProducer = { QueueReport: jest.fn(), init: jest.fn() };
const mockFailRepo = { createLog: jest.fn() };

// Mock RabbitMQ channel
const mockChannel: Partial<Channel> = {
  assertQueue: jest.fn().mockResolvedValue(undefined),
  consume: jest.fn((queue, cb) => {
    (mockChannel as any)._callback = cb; // store callback
    return Promise.resolve({ consumerTag: "test" } as any);
  }),
  ack: jest.fn(),
};

// Helper to create a ConsumeMessage
const createMsg = (data: object): ConsumeMessage =>
  ({ content: Buffer.from(JSON.stringify(data)) } as ConsumeMessage);

describe("ReportsEmailConsumer UT", () => {
  let consumer: ReportsEmailConsumer;

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new ReportsEmailConsumer();

    // inject mocks
    (consumer as any).channel = mockChannel as Channel;
    (consumer as any).reportsEmailProducer = mockProducer;
    (consumer as any).failemailLogsRepo = mockFailRepo;
  });

  it("should send report email successfully", async () => {
    const emailData = {
      userId: "u1",
      to: "report@example.com",
      subject: "Report",
      data: { stats: 123 },
      createdAt: new Date(),
      retry: 0,
    };

    const msg = createMsg(emailData);
    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "mocked-id",
    });

    await consumer.ConsumeReportsEmail(emailData);
    await (mockChannel as any)._callback(msg);

    expect(authTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "report@example.com",
        subject: "Report",
        html: expect.any(String),
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should retry report email if SMTP fails and retry < 3", async () => {
    const emailData = {
      userId: "u2",
      to: "retry@example.com",
      subject: "Report",
      data: { stats: 999 },
      createdAt: new Date(),
      retry: 1,
    };

    const msg = createMsg(emailData);
    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP error")
    );

    await consumer.ConsumeReportsEmail(emailData);
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueReport).toHaveBeenCalledWith(
      expect.objectContaining({ to: "retry@example.com", retry: 2 })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should log to fail repo if report email exceeds max retries", async () => {
    const emailData = {
      userId: "u3",
      to: "dead@example.com",
      subject: "Report",
      data: { stats: 777 },
      createdAt: new Date(),
      retry: 3,
    };

    const msg = createMsg(emailData);
    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP down")
    );

    await consumer.ConsumeReportsEmail(emailData);
    await (mockChannel as any)._callback(msg);

    expect(mockFailRepo.createLog).toHaveBeenCalledWith(
      "dead@example.com",
      "Report",
      "report",
      expect.any(Object),
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});
