import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendOtpEmail from "../config/nodemailer.js";


// In-memory storage for temp signup data and OTPs
// tempSignups: email -> { name, phone, hashedPassword, expiresAt }
// otpStore: email -> { hashedCode, expiresAt }
const tempSignups = new Map();
const otpStore = new Map();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  return await sendOtpEmail(email, code);
};

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const emailLower = email.toLowerCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store temp signup data in memory (will be deleted after 10 mins or used)
    tempSignups.set(emailLower, { 
      name, 
      phone, 
      hashedPassword,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Store OTP in memory
    otpStore.set(emailLower, { hashedCode: hashedOtp, expiresAt });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      tempSignups.delete(emailLower);
      otpStore.delete(emailLower);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({
      message: 'Verification code sent to your email. Please verify to complete signup.',
      email: emailLower,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate OTP for unverified login
      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expiresAt = Date.now() + 10 * 60 * 1000;

      otpStore.set(email.toLowerCase(), { hashedCode: hashedOtp, expiresAt });

      // Send verification email
      await sendVerificationEmail(email, otp);

      return res.status(403).json({
        message: 'Email not verified. OTP sent to your email.',
        email: email.toLowerCase(),
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code, isNewSignup } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const emailLower = email.toLowerCase();
    const otpData = otpStore.get(emailLower);

    // Check if OTP exists
    if (!otpData) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(emailLower);
      tempSignups.delete(emailLower);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(code, otpData.hashedCode);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // If this is a new signup, create the user now
    if (isNewSignup) {
      const tempData = tempSignups.get(emailLower);
      if (!tempData) {
        return res.status(400).json({ message: 'Signup data expired. Please signup again.' });
      }

      // Create verified user
      const user = await User.create({
        name: tempData.name,
        email: emailLower,
        phone: tempData.phone,
        password: tempData.hashedPassword,
        emailVerified: true, // Mark as verified immediately
      });

      // Clean up
      tempSignups.delete(emailLower);
      otpStore.delete(emailLower);

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ 
        token, 
        user, 
        message: 'Email verified successfully. Account created!' 
      });
    } else {
      // Existing user verifying email after login
      const user = await User.findOneAndUpdate(
        { email: emailLower },
        { emailVerified: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Clean up
      otpStore.delete(emailLower);

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ token, user, message: 'Email verified successfully' });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailLower = email.toLowerCase();

    // Generate new OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory
    otpStore.set(emailLower, { hashedCode: hashedOtp, expiresAt });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      otpStore.delete(emailLower);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailLower = email.toLowerCase();
    
    // Check if user exists
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({ message: 'If email exists, OTP will be sent to it', email: emailLower });
    }

    // Generate new OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory
    otpStore.set(emailLower, { hashedCode: hashedOtp, expiresAt });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      otpStore.delete(emailLower);
      return res.status(500).json({ message: 'Failed to send reset OTP' });
    }

    res.json({ message: 'OTP sent successfully to your email', email: emailLower });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process forgot password' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }

    const emailLower = email.toLowerCase();
    const otpData = otpStore.get(emailLower);

    // Check if OTP exists
    if (!otpData) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(code, otpData.hashedCode);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await User.findOneAndUpdate(
      { email: emailLower },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up OTP
    otpStore.delete(emailLower);

    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Password reset failed' });
  }
};