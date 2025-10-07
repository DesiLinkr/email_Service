import { authTransporter } from "../smtp/auth.smtp";
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
      const info = await authTransporter.sendMail({
        from: "desilinkr<harshtagra905@gmail.com>",
        to,
        subject,
        html,
      });
      console.log(info);

      console.log(`✅ Report email sent to ${to}: ${info.messageId}`);
    } catch (err) {
      throw err;
    }
  };
}
