import { Sequelize } from "sequelize";
import { FailEmailLogs } from "../db/models/failEmailLogs.model";

export class FailEmailLogsRepository {
  private database: typeof FailEmailLogs;
  constructor(DbClient?: typeof FailEmailLogs) {
    this.database = FailEmailLogs ?? DbClient;
  }

  public createLog = async (
    to: string,
    subject: string,
    template: string,
    data: object,
    error: string
  ) => {
    await this.database.create({
      to,
      subject,
      template,
      data,
      error,
    });
  };
}
