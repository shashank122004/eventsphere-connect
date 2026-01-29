import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Create transporter with Gmail or other email service
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpEmail = async (email, code) => {
  try {
    // Validate email config
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('EMAIL_USER or EMAIL_PASSWORD is not set in environment variables');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="font-size: 48px; letter-spacing: 10px; font-weight: bold; color: #007bff; margin: 0;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">Eventify Team</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email, 'Message ID:', info.messageId);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

export default sendOtpEmail;