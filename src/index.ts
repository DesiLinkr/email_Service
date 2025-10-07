import App from "./app";

const app = new App();
app.startServer(Number(process.env.Port) || 4999);
