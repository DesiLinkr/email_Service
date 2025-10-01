import { EmailService } from "../../../src/services/email.service";
import { authTransporter } from "../../../src/smtp/auth.smtp";
import { renderTemplate } from "../../../src/utils/renderTemplate";

jest.mock("../../../src/smtp/auth.smtp", () => ({
  authTransporter: {
    sendMail: jest.fn(),
  },
}));

jest.mock("../../../src/utils/renderTemplate", () => ({
  renderTemplate: jest.fn(),
}));

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
    // Arrange
    const fakeHtml = "<h1>Hello</h1>";
    (renderTemplate as jest.Mock).mockReturnValue(fakeHtml);
    (authTransporter.sendMail as jest.Mock).mockResolvedValue({
      messageId: "12345",
    });

    // Act
    await emailService.sendEmail(
      "test@example.com",
      "Test Subject",
      "test-template",
      { name: "Harsh" }
    );

    // Assert
    expect(renderTemplate).toHaveBeenCalledWith("test-template", {
      name: "Harsh",
    });
    expect(authTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_REPORT_FROM,
      to: "test@example.com",
      subject: "Test Subject",
      html: fakeHtml,
    });
  });

  it("should throw an error if sending fails", async () => {
    // Arrange
    const fakeHtml = "<h1>Hello</h1>";
    (renderTemplate as jest.Mock).mockReturnValue(fakeHtml);
    (authTransporter.sendMail as jest.Mock).mockRejectedValue(
      new Error("SMTP error")
    );

    // Act & Assert
    await expect(
      emailService.sendEmail(
        "fail@example.com",
        "Fail Subject",
        "fail-template",
        { name: "Error" }
      )
    ).rejects.toThrow("SMTP error");
  });
});
