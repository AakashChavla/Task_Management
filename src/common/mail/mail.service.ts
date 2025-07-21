import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
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

  async sendVerificationOTPEmail(to: string, otp: number, userName: string) {
    const subject = 'Verify Your Email - Task Management Registration';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3182ce; margin: 0;">Task Management</h1>
        <p style="color: #718096; margin: 5px 0;">Your Productivity Partner</p>
      </div>
      
      <div style="background-color: #f7fafc; border-radius: 8px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #2d3748; text-align: center; margin-bottom: 20px;">Email Verification Required</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Thank you for registering with Task Management. Please verify your email address using the OTP below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #3182ce 0%, #63b3ed 100%); color: white; padding: 20px; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
        </div>
        
        <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0;">
          <p style="color: #c53030; margin: 0; font-weight: bold;">⏱️ Important: This OTP is valid for 15 minutes only.</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #718096; font-size: 14px;">Best regards,<br><strong>Task Management Team</strong></p>
      </div>
    </div>
  `;

    return this.sendEmail({ to, subject, html });
  }

  async sendWelcomeEmail(to: string, userName: string) {
    const subject = 'Welcome to Task Management!';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3182ce; margin: 0;">Task Management</h1>
        <p style="color: #718096; margin: 5px 0;">Your Productivity Partner</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #2d3748; text-align: center; margin-bottom: 20px;">Welcome, <span style="color:#3182ce">${userName}</span>!</h2>
        
        <p style="color: #4a5568; font-size: 17px; line-height: 1.7; text-align: center;">
          🎉 <strong>Your registration was successful!</strong><br>
          We’re excited to have you on board with <b>Task Management</b>.
        </p>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
          You can now start creating, assigning, and tracking your tasks with ease.<br>
          If you have any questions, just reply to this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://your-app-url.com" style="background: #3182ce; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; margin-bottom: 10px;">
          Go to Dashboard
        </a>
        <p style="color: #718096; font-size: 14px; margin-top: 18px;">Best regards,<br><strong>Task Management Team</strong></p>
      </div>
    </div>
  `;

    return this.sendEmail({ to, subject, html });
  }

  
}
