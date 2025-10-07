import * as grpc from "@grpc/grpc-js";
import { emailService } from "./services/emailservice";
import { EmailService } from "./generated/email";

export async function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(EmailService, emailService);
  return server;
}
