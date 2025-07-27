import dotenv from "dotenv";
dotenv.config();

import sequelize from "./config/db";
import "./models/email_log";
import startGrpcServer from "./grpc/index";

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected and synced");
    startGrpcServer();
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
}

start();
