import { AuthEmailConsumer } from "../../../../src/mq/consumers/auth.consumer";
import { authTransporter } from "../../../../src/smtp/auth.smtp";
import { Channel, ConsumeMessage } from "amqplib";

// Mock SMTP transporter
jest.mock("../../../../src/smtp/auth.smtp", () => ({
  authTransporter: { sendMail: jest.fn() },
}));

// Mock producer and fail repo
const mockProducer = {
  QueueVerificationEmail: jest.fn(),
  QueueAccessEmail: jest.fn(),
};
const mockFailRepo = { createLog: jest.fn() };

// Mock channel
const mockChannel: Partial<Channel> = {
  assertQueue: jest.fn().mockResolvedValue(undefined),
  consume: jest.fn((queue, cb) => {
    // store callback to call later in test
    (mockChannel as any)._callback = cb;
    return Promise.resolve({ consumerTag: "test" } as any);
  }),
  ack: jest.fn(),
};

// Helper to create a proper ConsumeMessage
const createMsg = (data: object): ConsumeMessage =>
  ({
    content: Buffer.from(JSON.stringify(data)),
  } as ConsumeMessage);

describe("AuthEmailConsumer with Mock SMTP", () => {
  let consumer: AuthEmailConsumer;

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new AuthEmailConsumer(
      mockProducer as any,
      undefined,
      mockFailRepo as any
    );
    (consumer as any).channel = mockChannel as Channel;
  });

  it("should send verification email successfully", async () => {
    const msg = createMsg({
      to: "test@example.com",
      subject: "Verify",
      data: { code: "1234" },
      retry: 0,
    });

    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "mocked-id",
    });

    await consumer.ConsumeVerificationEmail();
    await (mockChannel as any)._callback(msg);

    expect(authTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Verify",
        html: expect.any(String),
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should retry verification email if SMTP fails and retry < 3", async () => {
    const msg = createMsg({
      to: "retry@example.com",
      subject: "Verify",
      data: { code: "5678" },
      retry: 0,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP error")
    );

    await consumer.ConsumeVerificationEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "retry@example.com",
        retry: 1,
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should log failure if verification email exceeds max retries", async () => {
    const msg = createMsg({
      to: "dead@example.com",
      subject: "Verify",
      data: { code: "9999" },
      retry: 3,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP down")
    );

    await consumer.ConsumeVerificationEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockFailRepo.createLog).toHaveBeenCalledWith(
      "dead@example.com",
      "Verify",
      "report",
      expect.any(Object),
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should send access email successfully", async () => {
    const msg = createMsg({
      to: "access@example.com",
      subject: "Access",
      data: { token: "abcd" },
      retry: 0,
    });

    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "mocked-id",
    });

    await consumer.ConsumeueueAccessEmail();
    await (mockChannel as any)._callback(msg);

    expect(authTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "access@example.com",
        subject: "Access",
        html: expect.any(String),
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should retry access email if SMTP fails and retry < 3", async () => {
    const msg = createMsg({
      to: "retry-access@example.com",
      subject: "Access",
      data: { token: "efgh" },
      retry: 2,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("Timeout")
    );

    await consumer.ConsumeueueAccessEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueAccessEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "retry-access@example.com",
        retry: 3,
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
  it("should log failure if access email exceeds max retries", async () => {
    const msg = createMsg({
      to: "dead@example.com",
      subject: "Verify",
      data: { code: "9999" },
      retry: 3,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP down")
    );

    await consumer.ConsumeueueAccessEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockFailRepo.createLog).toHaveBeenCalledWith(
      "dead@example.com",
      "Verify",
      "report",
      expect.any(Object),
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});
