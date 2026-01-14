import * as grpc from "@grpc/grpc-js";
import { createGrpcServer } from "./grpc/server";
import { AuthEmailConsumer } from "./mq/consumers/auth.consumer";
import express, { Application } from "express";
import routes from "./routes/index.routes";

import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
class App {
  private authEmailConsumer: AuthEmailConsumer;

  private express: Application;
  private PORT: number;
  private GRPCPORT: number;
  constructor() {
    this.authEmailConsumer = new AuthEmailConsumer();
    this.GRPCPORT = Number(process.env.GRPCPORT);
    this.PORT = Number(process.env.PORT);
    this.express = express();
    this.middleware();
    this.routes();
    this.notFoundHandler();
  }
  private middleware = () => {
    this.express.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    );
    this.express.use(cookieParser());
    this.express.use(express.json());
  };
  // Routes
  private routes = () => {
    this.express.use("/api", routes);
  };
  // 404 handler
  private notFoundHandler = () => {
    this.express.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });
  };
  public getInstance = (): Application => {
    return this.express;
  };

  public startServers = async (port: number, grpcPort: number) => {
    this.PORT = this.PORT || port;
    this.GRPCPORT = this.GRPCPORT || grpcPort;
    this.express.listen(this.PORT, () => {
      console.log(`Server running at http://localhost:${this.PORT}`);
    });
    const grpcServer = await createGrpcServer();
    grpcServer.bindAsync(
      `0.0.0.0:${grpcPort}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error(`grpc Server could not start. Error: ${err}`);
          return;
        }
        console.log(`grpc Server is running on port ${port}`);
      }
    );

    await this.authEmailConsumer.init();
    await this.authEmailConsumer.ConsumeVerificationEmail();
    await this.authEmailConsumer.ConsumeueueAccessEmail();
    await this.authEmailConsumer.ConsumeueueforgotPassword();
  };
}

export default App;
