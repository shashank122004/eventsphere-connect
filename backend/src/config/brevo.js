import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendOtpEmail = async (email, code) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is missing');
      return false;
    }

    const payload = {
      sender: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || 'Eventify',
      },
      to: [
        {
          email,
        },
      ],
      subject: 'Your Email Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 8px;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">
            If you didn’t request this, ignore this email.
          </p>
        </div>
      `,
    };

    const res = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000, // ⏱️ 10 seconds safety
    });

    console.log('OTP email sent:', res.data.messageId || 'success');
    return true;
  } catch (err) {
    console.error(
      'Brevo email error:',
      err.response?.data || err.message
    );
    return false;
  }
};

export default sendOtpEmail;
