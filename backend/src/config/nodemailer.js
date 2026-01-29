import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.BREVO_USER || !process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
  throw new Error("Missing Brevo email environment variables");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,     // must be "apikey"
    pass: process.env.BREVO_API_KEY,  // real API key
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
});

// Verify SMTP once on server start
transporter.verify((error) => {
  if (error) {
    console.error("❌ Brevo SMTP connection failed:", error);
  } else {
    console.log("✅ Brevo SMTP ready to send emails");
  }
});

const sendOtpEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Eventify" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1>${code}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="font-size: 12px; color: #888;">Eventify Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 OTP sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return false;
  }
};

export default sendOtpEmail;
