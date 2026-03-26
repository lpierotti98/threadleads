'use client';

import Link from 'next/link';

const BASE = 'https://threadleads-b445.vercel.app';
const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = '#334155';
const TEXT = '#f1f5f9';
const TEXT2 = '#94a3b8';
const ACCENT = '#818cf8';
const GREEN = '#34d399';
const CODE_BG = '#0c1222';

function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: CODE_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: 20,
        overflow: 'auto',
        fontSize: 13,
        lineHeight: 1.7,
        fontFamily: "'IBM Plex Mono', monospace",
        color: TEXT2,
      }}
    >
      {children}
    </pre>
  );
}

function Badge({ method }: { method: string }) {
  const c = method === 'GET' ? GREEN : ACCENT;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 4,
        background: c,
        color: '#0f172a',
      }}
    >
      {method}
    </span>
  );
}

function Endpoint({
  method,
  path,
  desc,
  bodyFields,
  queryParams,
  curl,
  response,
}: {
  method: string;
  path: string;
  desc: string;
  bodyFields?: Array<{ name: string; type: string; desc: string; required?: boolean }>;
  queryParams?: Array<{ name: string; type: string; desc: string }>;
  curl: string;
  response: string;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 48, marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Badge method={method} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: TEXT }}>
          {path}
        </span>
      </div>
      <p style={{ color: TEXT2, fontSize: 15, marginBottom: 24 }}>{desc}</p>

      {bodyFields && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Request Body
          </p>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {bodyFields.map((f, i) => (
              <div
                key={f.name}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 16px',
                  borderTop: i > 0 ? `1px solid ${BORDER}` : 'none',
                  fontSize: 13,
                }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: TEXT, minWidth: 120 }}>
                  {f.name}
                  {f.required && <span style={{ color: '#f87171' }}>*</span>}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: ACCENT, minWidth: 80, fontSize: 12 }}>{f.type}</span>
                <span style={{ color: TEXT2 }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {queryParams && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Query Parameters
          </p>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {queryParams.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 16px',
                  borderTop: i > 0 ? `1px solid ${BORDER}` : 'none',
                  fontSize: 13,
                }}
              >
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: TEXT, minWidth: 120 }}>{p.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: ACCENT, minWidth: 80, fontSize: 12 }}>{p.type}</span>
                <span style={{ color: TEXT2 }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        Example Request
      </p>
      <Code>{curl}</Code>

      <p style={{ fontSize: 12, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 20 }}>
        Example Response
      </p>
      <Code>{response}</Code>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, background: ACCENT, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>TL</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT }}>ThreadLeads</span>
          </Link>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <Link href="/dashboard" style={{ color: TEXT2, textDecoration: 'none' }}>Dashboard</Link>
            <Link href="/settings" style={{ color: TEXT2, textDecoration: 'none' }}>Settings</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>
          API Reference
        </p>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: TEXT }}>
          ThreadLeads API
        </h1>
        <p style={{ fontSize: 17, color: TEXT2, marginTop: 12, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
          Integrate buying intent signals from Reddit and Hacker News into your product.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Getting started */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Getting Started</h2>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 24, fontSize: 14, lineHeight: 1.8, color: TEXT2 }}>
            <p><strong style={{ color: TEXT }}>1.</strong> Generate an API key from <Link href="/settings" style={{ color: ACCENT }}>Settings</Link>.</p>
            <p><strong style={{ color: TEXT }}>2.</strong> Add the key to all requests:</p>
            <Code>{`Authorization: Bearer YOUR_API_KEY`}</Code>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>3.</strong> Base URL:</p>
            <Code>{`${BASE}/api/v1`}</Code>
          </div>
        </section>

        {/* Endpoints */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Endpoints</h2>

          <Endpoint
            method="POST"
            path="/api/v1/scan"
            desc="Scan Reddit and Hacker News for threads matching your keywords. Returns scored threads with buying intent analysis."
            bodyFields={[
              { name: 'keywords', type: 'string[]', desc: 'Search keywords (max 5)', required: true },
              { name: 'days', type: 'number', desc: 'Time range: 1, 7, 30, or 90 (default 7)' },
            ]}
            curl={`curl -X POST ${BASE}/api/v1/scan \\
  -H "Authorization: Bearer tl_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"keywords": ["AI customer support", "automate lead gen"], "days": 7}'`}
            response={`{
  "threads": [
    {
      "title": "Ask HN: Best tool for automating lead generation?",
      "url": "https://news.ycombinator.com/item?id=12345",
      "source": "hn",
      "subreddit": null,
      "score": 87,
      "urgency": "high",
      "score_reason": "User actively seeking automation tool for lead generation.",
      "created_at": "2026-03-27T10:00:00Z"
    }
  ]
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/threads"
            desc="Retrieve your scored threads with filtering and pagination."
            queryParams={[
              { name: 'min_score', type: 'number', desc: 'Minimum intent score (0-100, default 0)' },
              { name: 'source', type: 'string', desc: 'Filter by "reddit" or "hn"' },
              { name: 'limit', type: 'number', desc: 'Results per page (1-100, default 20)' },
              { name: 'offset', type: 'number', desc: 'Pagination offset (default 0)' },
            ]}
            curl={`curl "${BASE}/api/v1/threads?min_score=60&source=reddit&limit=10" \\
  -H "Authorization: Bearer tl_live_abc123..."`}
            response={`{
  "threads": [
    {
      "id": "uuid-here",
      "title": "Looking for an AI tool to help with customer support",
      "url": "https://www.reddit.com/r/SaaS/comments/...",
      "source": "reddit",
      "subreddit": "SaaS",
      "score": 92,
      "urgency": "high",
      "score_reason": "Strong buying signal...",
      "reply_generated": false,
      "marked_done": false,
      "created_at": "2026-03-27T08:30:00Z"
    }
  ],
  "total": 47,
  "limit": 10,
  "offset": 0
}`}
          />

          <Endpoint
            method="POST"
            path="/api/v1/reply"
            desc="Generate an expert AI reply for a forum thread."
            bodyFields={[
              { name: 'title', type: 'string', desc: 'Thread title (max 500 chars)', required: true },
              { name: 'content', type: 'string', desc: 'Thread body content (max 500 chars)' },
              { name: 'product_mention', type: 'string', desc: 'Your product description to mention naturally' },
            ]}
            curl={`curl -X POST ${BASE}/api/v1/reply \\
  -H "Authorization: Bearer tl_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Best way to automate forum lead gen?", "content": "I spend 2 hours daily...", "product_mention": "Acme (acme.com) - automates lead gen"}'`}
            response={`{
  "reply": "I ran into this exact problem last year. What worked for me was focusing on specific pain-point phrases rather than broad keywords. Instead of searching for 'marketing tool' I searched for 'tired of manually finding leads' and the hit rate jumped from 2% to about 15%. The key is matching the language people actually use when they're frustrated, not industry jargon. What kind of product are you generating leads for?"
}`}
          />
        </section>

        {/* Rate Limits */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Rate Limits</h2>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: SURFACE, padding: '12px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT2, borderBottom: `1px solid ${BORDER}` }}>
              <span>Plan</span><span>Scans/day</span><span>Replies/month</span><span>API calls/min</span>
            </div>
            {[
              ['Starter ($49)', '1', '50', '10'],
              ['Pro ($99)', '3', '200', '30'],
            ].map((row) => (
              <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 16px', fontSize: 14, borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ color: TEXT, fontWeight: 500 }}>{row[0]}</span>
                <span style={{ color: TEXT2 }}>{row[1]}</span>
                <span style={{ color: TEXT2 }}>{row[2]}</span>
                <span style={{ color: TEXT2 }}>{row[3]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Code examples */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Code Examples</h2>

          <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>JavaScript / Node.js</p>
          <Code>{`const res = await fetch("${BASE}/api/v1/scan", {
  method: "POST",
  headers: {
    "Authorization": "Bearer tl_live_abc123...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    keywords: ["AI customer support", "automate outreach"],
    days: 7,
  }),
});

const { threads } = await res.json();
console.log(\`Found \${threads.length} high-intent threads\`);`}</Code>

          <p style={{ fontSize: 13, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 24 }}>Python</p>
          <Code>{`import requests

res = requests.post(
    "${BASE}/api/v1/scan",
    headers={"Authorization": "Bearer tl_live_abc123..."},
    json={"keywords": ["AI customer support"], "days": 7},
)

threads = res.json()["threads"]
for t in threads:
    print(f"{t['score']}/100 — {t['title']}")`}</Code>
        </section>

        {/* Error codes */}
        <section>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Error Codes</h2>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 160px 1fr', background: SURFACE, padding: '12px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT2, borderBottom: `1px solid ${BORDER}` }}>
              <span>Code</span><span>Type</span><span>Description</span>
            </div>
            {[
              ['400', 'Bad Request', 'Missing or invalid parameters in your request.'],
              ['401', 'Unauthorized', 'Missing, invalid, or expired API key.'],
              ['403', 'Forbidden', 'No active subscription on this account.'],
              ['429', 'Rate Limited', 'You have exceeded your plan limits. Check response body for details.'],
              ['500', 'Server Error', 'Something went wrong on our end. Try again later.'],
            ].map((row) => (
              <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '80px 160px 1fr', padding: '12px 16px', fontSize: 14, borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: row[0] === '500' ? '#f87171' : ACCENT, fontWeight: 600 }}>{row[0]}</span>
                <span style={{ color: TEXT, fontWeight: 500 }}>{row[1]}</span>
                <span style={{ color: TEXT2 }}>{row[2]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '32px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: TEXT2 }}>
          <span>&copy; {new Date().getFullYear()} ThreadLeads</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/" style={{ color: TEXT2, textDecoration: 'none' }}>Home</Link>
            <Link href="/pricing" style={{ color: TEXT2, textDecoration: 'none' }}>Pricing</Link>
            <Link href="/dashboard" style={{ color: TEXT2, textDecoration: 'none' }}>Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
