import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function emailTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ThreadLeads</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
  <!-- Header -->
  <tr>
    <td style="background:#0f172a;padding:28px 32px;border-radius:12px 12px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:28px;height:28px;background:#4f46e5;border-radius:6px;text-align:center;vertical-align:middle;">
          <span style="color:#fff;font-size:11px;font-weight:700;font-family:'Courier New',monospace;line-height:28px;">TL</span>
        </td>
        <td style="padding-left:10px;">
          <span style="color:#ffffff;font-size:17px;font-weight:700;">ThreadLeads</span>
        </td>
      </tr></table>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="background:#ffffff;padding:36px 32px;border-radius:0 0 12px 12px;">
      ${body}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="padding:24px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
        ThreadLeads &middot; <a href="https://threadleads.app" style="color:#94a3b8;text-decoration:underline;">threadleads.app</a>
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">
        You received this email because you signed up for ThreadLeads. No further marketing emails will be sent without your consent.
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, name: string) {
  const displayName = name || email.split('@')[0];

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Welcome aboard, ${displayName}!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;">
      ThreadLeads scans Reddit and Hacker News for buying intent, scores every thread with AI, and generates expert replies so you show up in the right conversations.
    </p>

    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#0f172a;">Get started in 3 steps:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border-radius:8px;margin-bottom:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;height:28px;background:#eef2ff;border-radius:6px;text-align:center;vertical-align:middle;">
              <span style="color:#4f46e5;font-size:13px;font-weight:700;">1</span>
            </td>
            <td style="padding-left:12px;">
              <a href="https://threadleads.app/settings/keywords" style="font-size:14px;font-weight:600;color:#4f46e5;text-decoration:none;">Add your keywords</a>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Describe your product so the AI knows what to look for.</p>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border-radius:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;height:28px;background:#eef2ff;border-radius:6px;text-align:center;vertical-align:middle;">
              <span style="color:#4f46e5;font-size:13px;font-weight:700;">2</span>
            </td>
            <td style="padding-left:12px;">
              <a href="https://threadleads.app/dashboard" style="font-size:14px;font-weight:600;color:#4f46e5;text-decoration:none;">Run your first scan</a>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Hit Scan Now to find high-intent threads on Reddit &amp; HN.</p>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border-radius:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:28px;height:28px;background:#eef2ff;border-radius:6px;text-align:center;vertical-align:middle;">
              <span style="color:#4f46e5;font-size:13px;font-weight:700;">3</span>
            </td>
            <td style="padding-left:12px;">
              <span style="font-size:14px;font-weight:600;color:#0f172a;">Generate your first reply</span>
              <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Click any thread and let AI write an expert response.</p>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="https://threadleads.app/dashboard" style="display:inline-block;padding:14px 36px;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
        </td>
      </tr>
    </table>
  `;

  await resend.emails.send({
    from: 'ThreadLeads <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to ThreadLeads 👋',
    html: emailTemplate(body),
  });
}
