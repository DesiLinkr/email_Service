import amqp from "amqplib";

let connection: any = null;
let channel: any = null;

export const initRabbitMQ = async (): Promise<any> => {
  if (channel) return channel; // reuse if already created

  try {
    connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    channel = await connection.createChannel();

    console.log("✅ RabbitMQ connected");
    return await channel;
  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error);
    throw error;
  }
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    await channel?.close();
    await connection?.close();
    channel = null;
    connection = null;
    console.log("🛑 RabbitMQ connection closed");
  } catch (error) {
    console.error("❌ Error closing RabbitMQ connection:", error);
  }
};
