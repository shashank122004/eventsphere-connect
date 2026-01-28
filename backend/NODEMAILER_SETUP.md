# Nodemailer Setup Guide for Eventify

## Overview
The application has been updated to use **Nodemailer** instead of Resend for email sending. All OTP verification flows remain the same.

## Changes Made

### 1. Backend Configuration Files

#### `backend/src/config/resend.js` → Now uses Nodemailer
- **Old:** Resend API-based email service
- **New:** Nodemailer SMTP configuration
- Supports Gmail (default) or any other SMTP provider
- HTML email template with improved styling

#### `backend/.env`
Updated with Nodemailer configuration:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Eventify <your-email@gmail.com>
```

#### `backend/.env.example`
Updated with template variables for email configuration

### 2. Backend Auth Controller
- **No changes to auth.controller.js** - Email sending function works the same way
- OTP generation, hashing, and verification remain unchanged
- Account creation deferred until OTP verification (existing feature maintained)

### 3. Frontend
- **No changes required** - API calls remain the same
- Signup flow: Still generates OTP on signup, shows verification screen
- Login flow: Still requires email verification if `emailVerified: false`
- Email verification on valid OTP entry

## Gmail Setup Instructions

### Step 1: Enable 2-Step Verification in Google Account
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows/Mac/Linux"
3. Google will generate a 16-character password
4. Copy this password

### Step 3: Configure .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character app password
EMAIL_FROM=Eventify <your-email@gmail.com>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Alternative SMTP Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
```

## Verification Email Flow

1. **User Signup**: Enters name, email, phone, password
   - Server stores temp signup data in memory
   - Generates OTP and sends via email
   - Responds with email confirmation message (no account created yet)

2. **OTP Verification**: User enters 6-digit code
   - Server validates OTP hash
   - Creates user account (if new signup)
   - Marks email as verified
   - Returns token and user object

3. **Login with Unverified Email**: If user logs in but hasn't verified email
   - Server sends OTP verification email
   - User must verify before accessing dashboard
   - Upon verification, email is marked as verified

## Testing

### Local Testing
```bash
# 1. Update .env with your email credentials
# 2. Start backend server
cd backend
npm start

# 3. Test in frontend
npm run dev

# 4. Try signup with test email
# 5. Check your email inbox for OTP code
```

### Error Handling
- Invalid email credentials: Check EMAIL_USER and EMAIL_PASSWORD in .env
- SMTP connection error: Verify EMAIL_HOST and EMAIL_PORT
- Gmail app password issues: Ensure 2-Step Verification is enabled first
- Email not received: Check spam folder, verify "Less secure apps" setting for some providers

## Key Features Maintained

✅ OTP generation (6-digit random code)  
✅ Bcrypt hashing for OTP security  
✅ 10-minute OTP expiration  
✅ In-memory OTP and temp signup storage  
✅ Account creation deferred until verification  
✅ Protected routes requiring email verification  
✅ Resend OTP functionality  
✅ Login email verification enforcement  

## Files Modified

1. `backend/src/config/resend.js` - Replaced Resend with Nodemailer
2. `backend/.env` - Added Nodemailer email configuration
3. `backend/.env.example` - Updated template
4. `frontend/src/types/index.ts` - Added `emailVerified` field to User interface

## No Changes Required

- `backend/src/controllers/auth.controller.js` - Works as-is
- `backend/src/routes/auth.routes.js` - Works as-is
- `frontend/src/pages/Auth.tsx` - Works as-is
- `frontend/src/lib/api.ts` - Works as-is
- All other backend routes and controllers

## Rollback Instructions

If you need to switch back to Resend:
1. Restore original `backend/src/config/resend.js` from git history
2. Update `.env` with `RESEND_API_KEY`
3. No other changes needed
