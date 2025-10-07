import { AuthEmailConsumer } from "../../../../src/mq/consumers/auth.consumer";
import { authTransporter } from "../../../../src/smtp/auth.smtp";
import { Channel, ConsumeMessage } from "amqplib";

// Mock FailEmailLogsRepository
const mockFailRepo = {
  createLog: jest.fn(),
};

// Mock AuthEmailProducer
const mockProducer = {
  QueueVerificationEmail: jest.fn(),
  QueueAccessEmail: jest.fn(),
  QueueforgotPasswordEmail: jest.fn(),
};

// Mock EmailService (we use authTransporter for sending)
jest.mock("../../../../src/smtp/auth.smtp", () => ({
  authTransporter: { sendMail: jest.fn() },
}));

// Mock RabbitMQ Channel
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
  ({
    content: Buffer.from(JSON.stringify(data)),
  } as ConsumeMessage);

describe("AuthEmailConsumer UT", () => {
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
      messageId: "mock-id",
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

  it("should retry verification email on SMTP failure if retry < 3", async () => {
    const msg = createMsg({
      to: "retry@example.com",
      subject: "Verify",
      data: {},
      retry: 1,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP error")
    );

    await consumer.ConsumeVerificationEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "retry@example.com", retry: 2 })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should log failure if verification email exceeds max retries", async () => {
    const msg = createMsg({
      to: "dead@example.com",
      subject: "Verify",
      data: {},
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
      "Verification",
      {},
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should send access email successfully", async () => {
    const msg = createMsg({
      to: "access@example.com",
      subject: "Access",
      resetLink: "",
      retry: 0,
    });

    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "mock-id",
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
      resetLink: "",
      retry: 2,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("Timeout")
    );

    await consumer.ConsumeueueAccessEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueAccessEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "retry-access@example.com", retry: 3 })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should log failure if access email exceeds max retries", async () => {
    const msg = createMsg({
      to: "dead-access@example.com",
      subject: "Access",
      data: {},
      retry: 3,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP down")
    );

    await consumer.ConsumeueueAccessEmail();
    await (mockChannel as any)._callback(msg);

    expect(mockFailRepo.createLog).toHaveBeenCalledWith(
      "dead-access@example.com",
      "Access",
      "access",
      {},
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should send forgotPassword email successfully", async () => {
    const msg = createMsg({
      to: "access@example.com",
      subject: "forgotPassword",
      resetLink: "",
      retry: 0,
    });

    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "mock-id",
    });

    await consumer.ConsumeueueforgotPassword();
    await (mockChannel as any)._callback(msg);

    expect(authTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "access@example.com",
        subject: "forgotPassword",
        html: expect.any(String),
      })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should log failure if forgotPassword email exceeds max retries", async () => {
    const msg = createMsg({
      to: "dead-access@example.com",
      subject: "forgotPassword",
      resetLink: "",
      retry: 3,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP down")
    );

    await consumer.ConsumeueueforgotPassword();
    await (mockChannel as any)._callback(msg);

    expect(mockFailRepo.createLog).toHaveBeenCalledWith(
      "dead-access@example.com",
      "forgotPassword",
      "forgotPassword",
      { resetLink: "" },
      "SMTP down"
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });

  it("should retry forgotPassword email if SMTP fails and retry < 3", async () => {
    const msg = createMsg({
      to: "retry-access@example.com",
      subject: "Access",
      resetLink: "",
      retry: 2,
    });

    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("Timeout")
    );

    await consumer.ConsumeueueforgotPassword();
    await (mockChannel as any)._callback(msg);

    expect(mockProducer.QueueforgotPasswordEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "retry-access@example.com", retry: 3 })
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});
