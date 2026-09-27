import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(toEmail, username, goal) {
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailFrom = process.env.EMAIL_FROM || `"NIVANT 🌸" <${smtpUser || 'hello@nivant.app'}>`;

    if (!smtpUser || !smtpPass) {
      console.log('[Email Warning] SMTP_USER or SMTP_PASS not set in environment variables. Email notification skipped.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="background-color: #FFF5F6; padding: 40px 20px; font-family: 'Georgia', serif; color: #24191A;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 40px 32px; border: 1px solid #F5D1D8; box-shadow: 0 10px 30px rgba(36,25,26,0.05);">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 26px; color: #5C3840; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
              📖 NIVANT.
            </h1>
            <p style="font-size: 13px; color: #80676C; letter-spacing: 1px; margin-top: 6px;">
              A place where you can relax, find peace, and build something of your own.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #FCE8EC; margin: 24px 0;" />

          <h2 style="color: #44292F; font-size: 22px; margin-top: 0;">
            Welcome to NIVANT, ${username}! 🌸
          </h2>

          <p style="font-size: 16px; line-height: 1.7; color: #4A3A3D;">
            We are so delighted to welcome you into our quiet, peaceful space of reflection and growth.
          </p>

          ${
            goal
              ? `
            <div style="background: #FFF0F2; border-left: 4px solid #DFA3B1; padding: 18px 20px; border-radius: 12px; margin: 24px 0;">
              <p style="font-size: 13px; font-weight: bold; color: #8C5662; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">🌱 Your Seeded Goal</p>
              <p style="font-size: 17px; font-style: italic; color: #382025; margin: 0;">"${goal}"</p>
            </div>
            `
              : ''
          }

          <p style="font-size: 16px; line-height: 1.7; color: #4A3A3D;">
            Whatever your goal is, believe in yourself and keep moving towards it. On the days when you doubt your progress, remember: we believe in your potential, your ideas, and everything you are capable of becoming.
          </p>

          <p style="font-size: 16px; line-height: 1.7; color: #4A3A3D;">
            Your personal roadmap is now waiting for you whenever you need a reminder of your journey.
          </p>

          <div style="text-align: center; margin: 32px 0 20px 0;">
            <a href="http://localhost:3000/my-roadmap" style="background: #5C3840; color: #FFFFFF; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block;">
              View My Personal Roadmap ✨
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #FCE8EC; margin: 32px 0 24px 0;" />

          <p style="font-size: 14px; color: #80676C; text-align: center; margin: 0;">
            With warmth & peace,<br />
            <strong>The NIVANT Team 💖</strong>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: emailFrom,
      to: toEmail,
      subject: `Welcome to NIVANT 🌸 | Your journey begins today`,
      html: htmlContent,
    });

    console.log(`[Email Success] Welcome email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[Email Error] Failed to send welcome email:', err.message);
    return false;
  }
}
