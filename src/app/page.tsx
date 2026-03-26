'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const BG = '#ffffff';
const TEXT = '#0f172a';
const TEXT2 = '#64748b';
const ACCENT = '#4f46e5';
const SURFACE = '#f8fafc';
const BORDER = '#e2e8f0';

/* ─── FAQ data ─── */
const faqs = [
  {
    q: 'Does it actually find real buying intent?',
    a: 'Yes. ThreadLeads uses Claude AI to analyze every thread and score it 0-100 based on buying signals. Only threads where someone is actively looking for a solution get surfaced. The average user finds 5-15 high-intent threads per scan.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No contracts, no commitments. Cancel from Settings with one click and your subscription ends at the billing period. No questions asked.',
  },
  {
    q: "What's the difference between Starter and Pro?",
    a: 'Starter gives you 1 scan per day with up to 5 keywords and 50 AI replies per month. Pro unlocks 3 daily scans, 10 keywords, and 200 replies. Both plans include full AI scoring and reply generation.',
  },
  {
    q: 'How does the AI reply generation work?',
    a: 'When you find a high-scoring thread, click Generate Reply. The AI writes a natural, expert-sounding response that directly addresses the problem. You can optionally include a subtle mention of your product. Edit before posting to make it yours.',
  },
  {
    q: 'Will my account get banned for posting AI replies?',
    a: 'The replies are designed to be genuinely helpful, not spammy. They read like a real practitioner sharing their experience. Always review and personalize before posting. The goal is to add value to the conversation, not to spam.',
  },
];

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const lastScroll = useRef(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrollY(y);
      setNavHidden(y > 100 && y > lastScroll.current);
      lastScroll.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const how1 = useInView();
  const how2 = useInView();
  const how3 = useInView();
  const demo = useInView();
  const pricing = useInView();
  const faqSection = useInView();

  return (
    <>
      <style>{`
        .font-display { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(79,70,229,0); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
        }
        @keyframes particle {
          0% { transform: translate(0,0); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }

        .animate-up { animation: fadeUp 0.7s ease-out both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }

        .section-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .section-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .btn-scale { transition: transform 0.15s ease, background 0.2s ease; }
        .btn-scale:hover { transform: scale(1.03); }
        .btn-scale:active { transform: scale(0.97); }
      `}</style>

      <div style={{ background: BG, color: TEXT }}>

        {/* ═══ NAVBAR ═══ */}
        <nav
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: scrollY > 20 ? 'rgba(255,255,255,0.85)' : 'transparent',
            backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
            borderBottom: scrollY > 20 ? `1px solid ${BORDER}` : '1px solid transparent',
            transform: navHidden ? 'translateY(-100%)' : 'translateY(0)',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, background: ACCENT, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
              ThreadLeads
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div className="hidden sm:flex" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <a href="#features" style={{ fontSize: 14, color: TEXT2, textDecoration: 'none' }}>Features</a>
                <a href="#pricing" style={{ fontSize: 14, color: TEXT2, textDecoration: 'none' }}>Pricing</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/login" style={{ fontSize: 14, color: TEXT2, textDecoration: 'none' }}>Sign in</Link>
                <Link href="/signup" className="btn-scale" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: ACCENT, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>Start free</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 24px 80px' }}>
          {/* Particles */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4, height: 4, borderRadius: '50%',
                  background: ACCENT,
                  opacity: 0.15,
                  left: `${10 + (i * 37) % 80}%`,
                  top: `${10 + (i * 53) % 80}%`,
                  // @ts-expect-error CSS custom properties
                  '--dx': `${(i % 2 ? 1 : -1) * 40}px`,
                  '--dy': `${(i % 3 ? -1 : 1) * 60}px`,
                  animation: `particle ${8 + (i % 5) * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          <div style={{ maxWidth: 720, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <h1 className="font-display animate-up" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: TEXT }}>
              Find buyers before<br />they find you
            </h1>
            <p className="animate-up delay-2" style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: TEXT2, marginTop: 20, lineHeight: 1.7, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              ThreadLeads scans Reddit and Hacker News in real time, scores every thread for buying intent, and writes expert replies — so you show up in the right conversations at the right moment.
            </p>
            <div className="animate-up delay-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-scale" style={{ fontSize: 15, fontWeight: 600, color: '#fff', background: ACCENT, padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
                Start for $49/month
              </Link>
              <a href="#features" className="btn-scale" style={{ fontSize: 15, fontWeight: 600, color: TEXT, border: `1.5px solid ${BORDER}`, padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
                See how it works
              </a>
            </div>
            <p className="animate-up delay-4" style={{ fontSize: 13, color: TEXT2, marginTop: 24 }}>
              Join founders already using ThreadLeads to turn forum conversations into pipeline.
            </p>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="features" style={{ padding: '100px 24px', background: SURFACE }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
            <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: TEXT, marginBottom: 60 }}>
              Three steps to inbound leads
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                { ref: how1, n: '01', title: 'Add your keywords', desc: 'Describe your product. The AI generates the exact pain-point phrases your buyers actually type on forums.', visible: how1.visible },
                { ref: how2, n: '02', title: 'We scan 24/7', desc: 'ThreadLeads monitors Reddit and Hacker News continuously, scoring every thread 0-100 for buying intent.', visible: how2.visible },
                { ref: how3, n: '03', title: 'Reply and convert', desc: 'One click generates an expert reply with your product mentioned naturally. Copy, paste, start conversations.', visible: how3.visible },
              ].map((s, i) => (
                <div
                  key={s.n}
                  ref={s.ref.ref}
                  className={`section-in ${s.visible ? 'visible' : ''}`}
                  style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 36, transitionDelay: `${i * 0.12}s` }}
                >
                  <span className="font-display" style={{ fontSize: 48, fontWeight: 700, color: ACCENT, opacity: 0.2, lineHeight: 1 }}>{s.n}</span>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, marginTop: 16, color: TEXT }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: TEXT2, marginTop: 8, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LIVE DEMO ═══ */}
        <section style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Live preview</p>
            <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: TEXT, marginBottom: 48 }}>
              See what you get
            </h2>
            <div
              ref={demo.ref}
              className={`section-in ${demo.visible ? 'visible' : ''}`}
              style={{ animation: demo.visible ? 'float 6s ease-in-out infinite' : 'none', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
            >
              {/* Thread card */}
              <div style={{ borderLeft: '4px solid #ef4444', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#ff6600', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>HN</span>
                  <span style={{ fontSize: 10, color: '#ef4444', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase' }}>high</span>
                  <span style={{ fontSize: 10, color: TEXT2, fontFamily: "'IBM Plex Mono', monospace", marginLeft: 'auto' }}>2h ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span
                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 28, fontWeight: 700, color: ACCENT, lineHeight: 1, flexShrink: 0, animation: 'pulse-ring 2s ease-out infinite', borderRadius: 6, padding: '2px 4px' }}
                  >
                    87
                  </span>
                  <div>
                    <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 600, color: TEXT }}>
                      Ask HN: Best way to automate forum lead generation?
                    </p>
                    <p style={{ fontSize: 13, color: TEXT2, marginTop: 6, lineHeight: 1.6 }}>
                      High buying intent: user is actively seeking a tool to automate lead generation from forum discussions.
                    </p>
                  </div>
                </div>
              </div>
              {/* Reply preview */}
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: 24, background: SURFACE }}>
                <p style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>AI-generated reply</p>
                <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7 }}>
                  I ran into this exact problem six months ago trying to find leads on Reddit for my SaaS. The manual approach of searching keywords daily was killing my mornings. What worked for me was setting up specific pain-point phrases rather than broad category terms. Instead of &quot;marketing automation&quot; I searched for &quot;tired of manually posting on forums&quot; and similar. The hit rate went from maybe 2% to about 15%.
                </p>
                <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginTop: 8 }}>
                  What kind of product are you trying to generate leads for?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" style={{ padding: '100px 24px', background: SURFACE }}>
          <div
            ref={pricing.ref}
            className={`section-in ${pricing.visible ? 'visible' : ''}`}
            style={{ maxWidth: 800, margin: '0 auto' }}
          >
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
            <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: TEXT, marginBottom: 48 }}>
              Simple, transparent pricing
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {[
                {
                  name: 'Starter', price: 49, desc: 'Perfect for solo founders',
                  features: ['1 full scan per day', 'Up to 5 keywords', '50 AI replies per month', 'Reddit & HN monitoring', 'AI intent scoring', 'AI reply generator'],
                },
                {
                  name: 'Pro', price: 99, desc: 'For serious lead generation', popular: true,
                  features: ['3 full scans per day', 'Up to 10 keywords', '200 AI replies per month', 'Everything in Starter', 'Priority support', 'Early access to features'],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    background: '#fff',
                    border: plan.popular ? `2px solid ${ACCENT}` : `1px solid ${BORDER}`,
                    borderRadius: 16, padding: 36, position: 'relative',
                  }}
                >
                  {plan.popular && (
                    <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
                      Most Popular
                    </span>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</p>
                  <div style={{ marginTop: 8 }}>
                    <span className="font-display" style={{ fontSize: 48, fontWeight: 700, color: TEXT }}>${plan.price}</span>
                    <span style={{ fontSize: 15, color: TEXT2 }}>/month</span>
                  </div>
                  <p style={{ fontSize: 14, color: TEXT2, marginTop: 4 }}>{plan.desc}</p>
                  <ul style={{ marginTop: 24, listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: 14, color: TEXT2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill={ACCENT} opacity="0.1"/><path d="M5 8l2 2 4-4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="btn-scale"
                    style={{
                      display: 'block', textAlign: 'center', marginTop: 28, padding: '14px 0', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                      background: plan.popular ? ACCENT : 'transparent',
                      color: plan.popular ? '#fff' : TEXT,
                      border: plan.popular ? 'none' : `1.5px solid ${BORDER}`,
                    }}
                  >
                    Get {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section style={{ padding: '100px 24px' }}>
          <div
            ref={faqSection.ref}
            className={`section-in ${faqSection.visible ? 'visible' : ''}`}
            style={{ maxWidth: 640, margin: '0 auto' }}
          >
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</p>
            <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: TEXT, marginBottom: 48 }}>
              Common questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '20px 0',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 16, fontWeight: 500, color: TEXT,
                    }}
                  >
                    {faq.q}
                    <span style={{
                      fontSize: 20, color: TEXT2, transition: 'transform 0.2s ease',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                      flexShrink: 0, marginLeft: 16,
                    }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: openFaq === i ? 300 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, paddingBottom: 20 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section style={{ padding: '80px 24px', background: TEXT }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff' }}>
              Ready to find your next customers?
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8', marginTop: 12, lineHeight: 1.7 }}>
              Start scanning Reddit and Hacker News for buying intent today.
            </p>
            <Link href="/signup" className="btn-scale" style={{ display: 'inline-block', marginTop: 28, fontSize: 15, fontWeight: 600, color: '#fff', background: ACCENT, padding: '14px 32px', borderRadius: 10, textDecoration: 'none' }}>
              Start for $49/month
            </Link>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ padding: '48px 24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Link href="/" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: TEXT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 24, background: ACCENT, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
              ThreadLeads
            </Link>
            <p style={{ fontSize: 13, color: TEXT2 }}>Turn forum conversations into inbound leads</p>
            <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
              <Link href="/dashboard" style={{ color: TEXT2, textDecoration: 'none' }}>Dashboard</Link>
              <Link href="/pricing" style={{ color: TEXT2, textDecoration: 'none' }}>Pricing</Link>
              <Link href="/login" style={{ color: TEXT2, textDecoration: 'none' }}>Sign in</Link>
              <Link href="/signup" style={{ color: TEXT2, textDecoration: 'none' }}>Sign up</Link>
            </div>
            <p style={{ fontSize: 12, color: TEXT2 }}>&copy; {new Date().getFullYear()} ThreadLeads. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
