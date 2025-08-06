import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private isMailServiceReady: boolean = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as SMTPTransport.Options);
  }

  async onModuleInit() {
    await this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.isMailServiceReady = true;
      this.logger.log("✅ Mail service connected successfully");
    } catch (error) {
      this.isMailServiceReady = false;
      this.logger.warn(
        "⚠️  Mail service configuration issue - emails will not be sent",
        error.message
      );
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendEmail(options: EmailOptions) {
    try {
      if (!options.to || !this.isValidEmail(options.to)) {
        this.logger.error("Invalid email address:", options.to);
        throw new Error("Invalid recipient email address");
      }

      this.logger.log("Attempting to send email to:", options.to);
      this.logger.log("Subject:", options.subject);

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || "SimplCase"}" <${
          process.env.SMTP_USER
        }>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        to: options.to,
        subject: options.subject,
      };
    } catch (error) {
      this.logger.error("Email sending error:", error);
      throw new Error("Failed to send email");
    }
  }

  // async sendVerificationEmail() {
  //   const subject = "";
  //   const html = `
  //   `;

  //   return this.sendEmail({ to, subject, html });
  // }

  getVerificationMailTemplate(userName: string, verificationLink: string) {
    return `
    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eaeaea;">
        <div style="padding: 32px;">
          <h2 style="color: #2d3748;">Welcome to Task Management, ${userName}!</h2>
          <p style="font-size: 16px; color: #4a5568;">
            Thank you for registering. Please verify your email to activate your account.
          </p>
          <a href="${verificationLink}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3182ce; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Verify Email
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #a0aec0;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;
  }
}
