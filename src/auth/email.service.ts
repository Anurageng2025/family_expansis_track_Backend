import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('EMAIL_HOST'),
      port: this.config.get('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to: email,
        subject: 'Your OTP for Family Expense Tracker Registration',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Family Expense Tracker</h2>
            <p>Your OTP for registration is:</p>
            <h1 style="background-color: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
              ${otp}
            </h1>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      // In development, log the OTP to console
      if (this.config.get('NODE_ENV') === 'development') {
        console.log(`📧 Development Mode - OTP for ${email}: ${otp}`);
      }
    }
  }

  async sendFamilyCode(
    email: string,
    userName: string,
    familyCode: string,
    familyName: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to: email,
        subject: 'Your Family Code - Family Expense Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Family Expense Tracker</h2>
            <p>Hi ${userName},</p>
            <p>You requested your family code. Here are your family details:</p>
            
            <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 10px 0;"><strong>Family Name:</strong> ${familyName}</p>
              <p style="margin: 10px 0;"><strong>Family Code:</strong></p>
              <h1 style="background-color: #ffffff; padding: 15px; text-align: center; letter-spacing: 5px; margin: 10px 0;">
                ${familyCode}
              </h1>
            </div>

            <p>Use this family code along with your email and password to login to your account.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you didn't request this, please ignore this email or contact support if you have concerns.
            </p>
          </div>
        `,
      });
      console.log(`✅ Family code email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending family code email:', error);
      // In development, log the family code to console
      if (this.config.get('NODE_ENV') === 'development') {
        console.log(`📧 Development Mode - Family Code for ${email}: ${familyCode} (Family: ${familyName})`);
      }
    }
  }

  async sendExpenseReminder(
    email: string,
    userName: string,
    familyName: string,
  ): Promise<void> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to: email,
        subject: '⏰ Daily Reminder: Update Your Expenses - Family Expense Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 2px solid #4CAF50; border-radius: 10px;">
            <div style="text-align: center; padding: 20px; background-color: #4CAF50; color: white; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
              <h1 style="margin: 0; font-size: 28px;">⏰ Daily Expense Reminder</h1>
            </div>

            <p style="font-size: 18px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              It's 9:00 PM! Time to update your expenses for today.
            </p>

            <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px;">
              <p style="margin: 5px 0; font-size: 14px;">
                <strong>📅 Date:</strong> ${currentDate}
              </p>
              <p style="margin: 5px 0; font-size: 14px;">
                <strong>👨‍👩‍👧‍👦 Family:</strong> ${familyName}
              </p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">📝 Don't forget to log:</h3>
              <ul style="line-height: 1.8; color: #555;">
                <li>🛒 Groceries and shopping</li>
                <li>🍔 Food and dining</li>
                <li>🚗 Transportation costs</li>
                <li>💡 Bills and utilities</li>
                <li>🎉 Entertainment</li>
                <li>💊 Healthcare</li>
                <li>📦 Any other expenses</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:8100/expenses" style="display: inline-block; padding: 15px 40px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                Add Today's Expenses
              </a>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; font-size: 13px; color: #555;">
                💡 <strong>Tip:</strong> Tracking daily expenses helps you stay within budget and achieve your financial goals!
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              You're receiving this daily reminder because you're a member of <strong>${familyName}</strong>.
              <br>
              Family Expense Tracker - Managing finances together! 💰
            </p>
          </div>
        `,
      });
      console.log(`✅ Expense reminder email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending expense reminder email:', error);
      // In development, log the reminder
      if (this.config.get('NODE_ENV') === 'development') {
        console.log(`📧 Development Mode - Expense Reminder for ${email} (${userName} - ${familyName})`);
      }
    }
  }
}

