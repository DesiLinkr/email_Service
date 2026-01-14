import { Request, Response } from "express";
import { AuthEmailProducer } from "../mq/producers/auth.producer";

export class EmailController {
  private readonly authEmailProducer: AuthEmailProducer;

  constructor() {
    this.authEmailProducer = new AuthEmailProducer();
  }
  sendAcesss = async (req: Request, res: Response) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueAccessEmail(req.body as any);
      res.status(200).json({ msg: "Email sent successfully" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
  sendVerification = async (req: Request, res: Response) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueVerificationEmail(req.body);

      res.status(200).json({ msg: "Email sent successfully" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
  sendforgotPassword = async (req: Request, res: Response) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueforgotPasswordEmail(req.body);
      res.status(200).json({ msg: "Email sent successfully" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
  sendReports = async (req: Request, res: Response) => {
    try {
      await this.authEmailProducer.init();
      await this.authEmailProducer.QueueVerificationEmail(req.body);
      res.status(200).json({ msg: "Emails sent successfully" });
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  };
}
