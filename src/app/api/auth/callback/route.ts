import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendWelcomeEmail } from '@/lib/emails';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Send welcome email after successful confirmation
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const name = user.user_metadata?.name || user.email.split('@')[0];
          await sendWelcomeEmail(user.email, name);
        }
      } catch (emailErr) {
        console.error('[auth/callback] Welcome email error:', emailErr);
      }

      return response;
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${request.nextUrl.origin}/login`);
}
