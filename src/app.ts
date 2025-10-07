import * as grpc from "@grpc/grpc-js";
import { createGrpcServer } from "./grpc/server";
import { AuthEmailConsumer } from "./mq/consumers/auth.consumer";
class App {
  private authEmailConsumer: AuthEmailConsumer;
  constructor() {
    this.authEmailConsumer = new AuthEmailConsumer();
  }
  public startServer = async (grpcPort: number) => {
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
