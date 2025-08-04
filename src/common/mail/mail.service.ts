import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface EmailOptions {
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
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
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
      this.logger.log('✅ Mail service connected successfully');
    } catch (error) {
      this.isMailServiceReady = false;
      this.logger.warn(
        '⚠️  Mail service configuration issue - emails will not be sent',
        error.message,
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
        this.logger.error('Invalid email address:', options.to);
        throw new Error('Invalid recipient email address');
      }

      this.logger.log('Attempting to send email to:', options.to);
      this.logger.log('Subject:', options.subject);

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'SimplCase'}" <${process.env.SMTP_USER}>`,
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
      this.logger.error('Email sending error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOTPEmail(to: string, otp: number, name: string) {
    const subject = "";
    const html = `
    `;

    return this.sendEmail({ to, subject, html });
  }
}
