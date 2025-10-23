import eventBus from "./eventBus";
import { sendEmail } from "../utils/sendEmail";


//Event: Send Welcome Email
eventBus.on("welcomeEmail", async (newUser) => {
  try {
    const options = {
        to: newUser.email,
        subject: "Welcome to Foda E-commerce Platform",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Welcome to Foda</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
      h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial,Helvetica,sans-serif; color:#1f2937;">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Welcome to Foda — we’re excited to have you on board.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f7fb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(17,24,39,0.08);">
          <tr>
            <td align="left" style="background:linear-gradient(135deg,#0ea5e9,#2563eb); padding:20px 24px;">
              <div style="font-size:18px; font-weight:700; color:#ffffff; letter-spacing:0.3px;">Foda</div>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:32px;">
              <h1 style="margin:0 0 12px; font-size:24px; line-height:1.25; color:#111827;">Welcome, ${newUser.username
            }!</h1>
              <p style="margin:0 0 16px; font-size:14px; line-height:1.7; color:#374151;">
                Thanks for joining Foda, your trusted e‑commerce platform. Your account has been created successfully.
              </p>
              <p style="margin:0 0 24px; font-size:14px; line-height:1.7; color:#374151;">
                Browse curated products, manage your cart, and enjoy a smooth checkout experience.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td>
                    <a href="${process.env.APP_URL || "#"
            }" style="display:inline-block; background-color:#2563eb; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600; font-size:14px;">
                      Visit Store
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
              <p style="margin:0; font-size:12px; color:#6b7280;">
                If you did not sign up for this account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px; background-color:#f9fafb; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#6b7280;">Foda E‑commerce</p>
              <p style="margin:0; font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} Foda. All rights reserved.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0; font-size:11px; color:#9ca3af;">
          You received this email because you created an account at Foda.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };
    await sendEmail(options);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
});