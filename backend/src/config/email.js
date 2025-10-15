const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use ethereal.email or mailtrap.io
  // For production, use your actual SMTP service (Gmail, SendGrid, AWS SES, etc.)
  
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development: log to console instead of sending real emails
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'rganapathi84@gmail.com',
        pass: process.env.SMTP_PASS || 'xyou pbof gicl appq'
      }
    });
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Time Sheet App" <noreply@timetrack.com>',
      to: email,
      subject: 'Your Login OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login Verification Code</h2>
          <p>Hi ${firstName},</p>
          <p>Your OTP code for login is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Time Sheet Application</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('OTP Email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send user creation email with OTP and password setup link
const sendUserCreationEmail = async (email, otp, firstName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const passwordSetupLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/set-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Time Sheet App" <noreply@timetrack.com>',
      to: email,
      subject: 'Welcome! Set Up Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Time Sheet App!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account has been successfully created. To get started, please set up your password using the link below:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${passwordSetupLink}" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Up Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; font-size: 12px;">
            ${passwordSetupLink}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <h3 style="color: #333;">Your Login OTP Code</h3>
          <p>For added security, here is your one-time password (OTP) for your first login:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in <strong>24 hours</strong>.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p><strong>Your login email:</strong> ${email}</p>
          <p>If you didn't expect this email, please contact your administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Time Sheet Application</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('User Creation Email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending user creation email:', error);
    throw new Error('Failed to send user creation email');
  }
};

module.exports = {
  sendOTPEmail,
  sendUserCreationEmail
};
