import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class EmailLog extends Model {}

EmailLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    to: DataTypes.STRING,
    subject: DataTypes.STRING,
    body: DataTypes.TEXT,
    status: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "email_logs",
    timestamps: true,
  }
);

export default EmailLog;
