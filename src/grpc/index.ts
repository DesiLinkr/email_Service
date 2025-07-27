import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "../proto/email.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDef);
const emailPackage = (grpcObject as any).EmailService;

function sendEmail(call: any, callback: any) {
  // Logic to send email using Nodemailer and log with Sequelize
  callback(null, { success: true, message: "Email sent (mock)" });
}

function main() {
  const server = new grpc.Server();
  server.addService(emailPackage.service, { SendEmail: sendEmail });
  const port = process.env.PORT || "50051";
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC server running on ${port}`);
    server.start();
  });
}

export default main;
