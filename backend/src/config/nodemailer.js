import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOtpEmail = async (email, code) => {
  try {
    const sendSmtpEmail = {
      to: [{ email }],
      sender: {
        email: process.env.EMAIL_FROM,
        name: "Eventify",
      },
      subject: "Your Email Verification Code",
      htmlContent: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${code}</h1>
        <p>Valid for 10 minutes</p>
      `,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP email sent:", data.messageId);
    return true;
  } catch (error) {
    console.error("❌ Brevo API email failed:", error.response?.body || error);
    return false;
  }
};

export default sendOtpEmail;
