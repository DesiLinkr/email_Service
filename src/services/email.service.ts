import axios from "axios";
import { renderTemplate } from "../utils/renderTemplate";

export class EmailService {
  sendEmail = async (
    to: string,
    subject: string,
    template: string,
    data: object
  ) => {
    const html = renderTemplate(template, data);

    try {
      const res = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            email: "harshtagra905@gmail.com",
            name: "DesiLinkr",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY!,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log(`✅ Email sent to ${to}`, res.data);
    } catch (err) {
      console.error("❌ Email send failed:", err);
      throw err;
    }
  };
}
