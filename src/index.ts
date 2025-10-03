import App from "./app";
import "dotenv/config";

const app = new App();
app.startServer(Number(process.env.Port) || 4999);
