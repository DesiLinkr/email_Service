import { FailEmailLogsRepository } from "../../../src/repositories/failEmailLogs.repository";
import { FailEmailLogs } from "../../../src/db/models/failEmailLogs.model";

jest.mock("../../../src/db/models/failEmailLogs.model", () => ({
  FailEmailLogs: {
    create: jest.fn(),
  },
}));

describe("FailEmailLogsRepository", () => {
  let repository: FailEmailLogsRepository;

  beforeEach(() => {
    repository = new FailEmailLogsRepository();
    jest.clearAllMocks();
  });

  it("should call FailEmailLogs.create with correct arguments", async () => {
    // Arrange
    const logData = {
      to: "test@example.com",
      subject: "Test Subject",
      template: "welcome-template",
      data: { name: "Harsh" },
      error: "SMTP error",
    };

    (FailEmailLogs.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      ...logData,
    });

    // Act
    await repository.createLog(
      logData.to,
      logData.subject,
      logData.template,
      logData.data,
      logData.error
    );

    // Assert
    expect(FailEmailLogs.create).toHaveBeenCalledWith({
      to: logData.to,
      subject: logData.subject,
      template: logData.template,
      data: logData.data,
      error: logData.error,
    });
  });

  it("should propagate errors if create fails", async () => {
    (FailEmailLogs.create as jest.Mock).mockRejectedValueOnce(
      new Error("DB failure")
    );

    await expect(
      repository.createLog("a@b.com", "subj", "tpl", {}, "err")
    ).rejects.toThrow("DB failure");
  });
});
