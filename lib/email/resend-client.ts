import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@example.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Physical AI & Humanoid Robotics Book',
};

// Email templates
export const emailTemplates = {
  /**
   * Email verification template
   */
  verification: (verificationUrl: string, userName?: string) => ({
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome${userName ? `, ${userName}` : ''}!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
            <p>Thanks for signing up for the Physical AI & Humanoid Robotics Book! To complete your registration and start tracking your learning journey, please verify your email address.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>

            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">${verificationUrl}</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin: 0;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Password reset template
   */
  passwordReset: (resetUrl: string, userName?: string) => ({
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc3545; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset your password${userName ? `, ${userName}` : ''}</h2>
            <p>We received a request to reset your password for your Physical AI & Humanoid Robotics Book account. Click the button below to choose a new password.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>

            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #dc3545;">${resetUrl}</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin: 0;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Welcome email (after successful verification)
   */
  welcome: (userName: string) => ({
    subject: 'Welcome to Physical AI & Humanoid Robotics!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're all set!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome, ${userName}!</h2>
            <p>Your email has been verified successfully. You can now access all personalized features:</p>

            <ul style="list-style: none; padding: 0;">
              <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">✅ Track your progress through chapters</li>
              <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">📚 Bookmark your favorite chapters</li>
              <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">💬 Get personalized AI chat assistance</li>
              <li style="padding: 10px 0;">🌍 Access content in multiple languages</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BETTER_AUTH_URL?.replace('localhost:3000', 'localhost:3001') || 'http://localhost:3001'}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Learning</a>
            </div>

            <p style="color: #666; font-size: 14px;">Happy learning! We're excited to have you on this journey into Physical AI and Humanoid Robotics.</p>
          </div>
        </body>
      </html>
    `,
  }),
};

/**
 * Send email using Resend
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.from}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
