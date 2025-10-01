import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(`${process.env.Database_url}`);

sequelize.authenticate();

export default sequelize;
