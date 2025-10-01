import nodemailer from "nodemailer";

export const reportTransporter = nodemailer.createTransport({
  host: process.env.SMTP_REPORT_HOST,
  port: Number(process.env.SMTP_REPORT_PORT) || 587,
  secure: process.env.SMTP_REPORT_SECURE === "true",
  auth: {
    user: process.env.SMTP_REPORT_USER,
    pass: process.env.SMTP_REPORT_PASS,
  },
});
