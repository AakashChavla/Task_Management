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

  async sendVerificationEmail() {
    const subject = "";
    const html = `
    `;

    // return this.sendEmail({ to, subject, html });
  }

  getOtpVerificationMailTemplate(userName: string, otp: string) {
    return `
    <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #e2e8f0;">
        <div style="padding: 32px;">
          <h2 style="color: #2b6cb0; margin-bottom: 16px;">Hello, ${userName}!</h2>
          <p style="font-size: 16px; color: #4a5568;">
            Use the following OTP to verify your email address:
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; background: #e6f0fa; color: #2b6cb0; padding: 16px 32px; border-radius: 8px; font-weight: bold;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #718096;">
            This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
          </p>
          <p style="margin-top: 36px; font-size: 13px; color: #a0aec0;">
            &mdash; The Task Management Team
          </p>
        </div>
      </div>
    </div>
  `;
  }
}
