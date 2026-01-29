import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // false for 587
  auth: {
    user: process.env.EMAIL_USER,      // "apikey" for Brevo
    pass: process.env.EMAIL_PASSWORD,  // Brevo SMTP key
  },
  tls: {
    rejectUnauthorized: false, // important for cloud environments
  },
  connectionTimeout: 10000, // ⏱️ 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendOtpEmail = async (email, code) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('EMAIL_USER or EMAIL_PASSWORD not set');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 8px;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

export default sendOtpEmail;
