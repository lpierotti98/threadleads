import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, user_id } = body;

    // Validate
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message must be under 2000 characters.' }, { status: 400 });
    }

    // Resolve user_id from session if not provided
    let resolvedUserId = user_id || null;
    if (!resolvedUserId) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) resolvedUserId = user.id;
      } catch { /* not logged in, that's fine */ }
    }

    // Save to DB
    const serviceClient = createServiceClient();
    const { error: dbError } = await serviceClient.from('support_tickets').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      user_id: resolvedUserId,
    });

    if (dbError) {
      console.error('[support] DB error:', dbError);
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'ThreadLeads Support <onboarding@resend.dev>',
          to: process.env.SUPPORT_EMAIL,
          subject: `[ThreadLeads Support] ${subject.trim()}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
              <h2 style="margin: 0 0 24px; font-size: 20px; color: #0f172a;">New Support Ticket</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 100px;">From</td><td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${name.trim()}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email.trim()}" style="color: #4f46e5;">${email.trim()}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Subject</td><td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${subject.trim()}</td></tr>
                ${resolvedUserId ? `<tr><td style="padding: 8px 0; color: #64748b;">User ID</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px; color: #64748b;">${resolvedUserId}</td></tr>` : ''}
              </table>
              <div style="margin-top: 24px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #0f172a; line-height: 1.7; white-space: pre-wrap;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Sent from ThreadLeads support form</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('[support] Email send error:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[support] Error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
