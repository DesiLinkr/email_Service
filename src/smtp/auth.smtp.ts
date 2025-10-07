import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const authTransporter = nodemailer.createTransport({
  host: process.env.SMTP_AUTH_HOST,
  port: Number(process.env.SMTP_AUTH_PORT) || 587,
  secure: process.env.SMTP_AUTH_SECURE === "true",
  auth: {
    user: process.env.SMTP_AUTH_USER,
    pass: process.env.SMTP_AUTH_PASS,
  },
});
