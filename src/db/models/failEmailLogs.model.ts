import { DataTypes, Model } from "sequelize";
import sequelize from "../config";
class FailEmailLogs extends Model {
  public id!: string;
  public to!: string;
  public subject!: string;
  public template!: string;
  public data!: object;
  public error!: string;
  public readonly createdAt!: Date;
}

FailEmailLogs.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    template: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    error: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  {
    tableName: "fail_email_logs",
    sequelize,
  }
);
// Optional: sync and log
sequelize.sync({ force: false });
export { FailEmailLogs };
