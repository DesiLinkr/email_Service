import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Check DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment!");
}

const sequelize = new Sequelize(`${process.env.DATABASE_URL}`);

sequelize.authenticate().then(() => {
  console.log("cooect");
});

export default sequelize;
