import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Seo } from '../lib/seo';

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: '/month',
    description: 'Explore EU funding with AI-powered matching',
    features: ['5 AI queries/month', 'All 4 matching tools', 'Browse CORDIS projects'],
    cta: 'Get started',
    ctaAction: 'signup' as const,
  },
  {
    name: 'Pro',
    price: '€29',
    period: '/month',
    annualPrice: '€290/year',
    annualSaving: 'Save €58',
    description: 'For researchers and SMEs applying for grants',
    features: ['100 AI queries/month', 'All 4 matching tools', 'Priority support', 'Export results'],
    highlight: true,
    cta: 'Upgrade to Pro',
    ctaAction: 'contact' as const,
  },
  {
    name: 'Team',
    price: '€99',
    period: '/month',
    annualPrice: '€990/year',
    annualSaving: 'Save €198',
    description: 'For consultancies and grant offices',
    features: ['500 AI queries/month', 'Up to 5 team members', 'All 4 matching tools', 'Dedicated support', 'API access'],
    cta: 'Contact us',
    ctaAction: 'contact' as const,
  },
];

export default function CreditsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuthModal } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [contactForm, setContactForm] = useState<{ plan: string; email: string; org: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // /credits duplicates /pricing — canonicalise to /pricing.
  const canonical = '/pricing';
  const isAlias = location.pathname === '/credits';

  function handleCta(plan: typeof PLANS[number]) {
    if (plan.ctaAction === 'signup') {
      if (user) navigate('/');
      else openAuthModal();
    } else {
      setContactForm({ plan: plan.name, email: user?.email ?? '', org: '' });
      setSubmitted(false);
    }
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm) return;
    // For now, mailto fallback — replace with API when payment integration is ready
    const subject = encodeURIComponent(`CORDIS Explorer ${contactForm.plan} — Upgrade request`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to upgrade to the ${contactForm.plan} plan.\n\nOrganisation: ${contactForm.org}\nEmail: ${contactForm.email}\n\nThanks`
    );
    window.location.href = `mailto:hello@cordis-explorer.eu?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen px-4 py-14" style={{ background: '#ffffff' }}>
      <Seo
        title="Pricing — CORDIS Explorer Plans for Researchers & SMEs"
        description="Free, Pro and Team plans for AI-powered EU grant matching. Find the right Horizon Europe funding calls for your research with unlimited AI queries on Pro and Team."
        canonical={canonical}
        noindex={isAlias}
        keywords="CORDIS Explorer pricing, EU grant matching pricing, Horizon Europe tools pricing, research funding SaaS"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'CORDIS Explorer',
          description: 'AI-powered search and matching for EU-funded research projects and grants.',
          brand: { '@type': 'Brand', name: 'CORDIS Explorer' },
          offers: [
            {
              '@type': 'Offer',
              name: 'Free',
              price: '0',
              priceCurrency: 'EUR',
              description: '5 AI queries/month, all matching tools, browse CORDIS projects',
            },
            {
              '@type': 'Offer',
              name: 'Pro',
              price: '29',
              priceCurrency: 'EUR',
              description: '100 AI queries/month, priority support, export results',
            },
            {
              '@type': 'Offer',
              name: 'Team',
              price: '99',
              priceCurrency: 'EUR',
              description: '500 AI queries/month, up to 5 seats, API access',
            },
          ],
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            Unlock unlimited grant matching
          </h1>
          <p className="text-base max-w-lg mx-auto mb-6" style={{ color: '#6a6a6a' }}>
            Find the right EU funding calls for your research. Every plan includes all four AI-powered matching tools.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 text-sm">
            <span style={{ color: annual ? '#aaaaaa' : '#222222', fontWeight: annual ? 400 : 600 }}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full border-0 cursor-pointer transition-colors duration-200"
              style={{ background: annual ? '#ff385c' : '#dddddd' }}
              aria-label="Toggle annual billing"
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                style={{ left: 2, transform: annual ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <span style={{ color: annual ? '#222222' : '#aaaaaa', fontWeight: annual ? 600 : 400 }}>
              Annual
              <span className="ml-1.5 text-xs font-bold" style={{ color: '#ff385c' }}>Save 2 months</span>
            </span>
          </div>
        </div>

        {/* Tools included */}
        <div
          className="rounded-2xl p-5 mb-10 flex flex-wrap gap-4 justify-center"
          style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
        >
          {[
            { label: 'Grant Search', icon: '🔍' },
            { label: 'Profile Match', icon: '🧠' },
            { label: 'GrantMatch Wizard', icon: '✅' },
            { label: 'Partner Matchmaking', icon: '🤝' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#484848' }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-7 flex flex-col"
              style={{
                background: '#ffffff',
                border: plan.highlight ? '2px solid #ff385c' : '1px solid #ebebeb',
                boxShadow: plan.highlight
                  ? 'rgba(255,56,92,0.12) 0px 0px 0px 4px, rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 16px'
                  : 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold rounded-full px-3 py-1"
                  style={{ background: '#ff385c', color: '#ffffff' }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6a6a6a' }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  {annual && plan.annualPrice ? (
                    <>
                      <span className="text-3xl font-bold" style={{ color: '#222222', letterSpacing: '-0.44px' }}>
                        {plan.annualPrice.replace('/year', '')}
                      </span>
                      <span className="text-sm" style={{ color: '#6a6a6a' }}>/year</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: '#222222', letterSpacing: '-0.44px' }}>
                        {plan.price}
                      </span>
                      <span className="text-sm" style={{ color: '#6a6a6a' }}>{plan.period}</span>
                    </>
                  )}
                </div>
                {annual && plan.annualSaving && (
                  <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>{plan.annualSaving}</p>
                )}
                <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#484848' }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: plan.highlight ? '#ff385c' : '#f2f2f2' }}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke={plan.highlight ? '#ffffff' : '#484848'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-0"
                style={
                  plan.highlight
                    ? { background: '#222222', color: '#ffffff' }
                    : { background: '#f2f2f2', color: '#222222' }
                }
                onClick={() => handleCta(plan)}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Contact form modal */}
        {contactForm && !submitted && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={e => { if (e.target === e.currentTarget) setContactForm(null); }}
          >
            <form
              onSubmit={handleContactSubmit}
              className="rounded-2xl p-8 w-full max-w-md mx-4"
              style={{ background: '#ffffff', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
            >
              <h2 className="text-xl font-bold mb-1" style={{ color: '#222222' }}>
                Upgrade to {contactForm.plan}
              </h2>
              <p className="text-sm mb-5" style={{ color: '#6a6a6a' }}>
                We'll follow up within 24 hours to get you set up.
              </p>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#484848' }}>Work email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 text-sm mb-4"
                style={{ border: '1px solid #dddddd', outline: 'none', background: '#fafafa' }}
                placeholder="you@organisation.eu"
              />
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#484848' }}>Organisation name</label>
              <input
                type="text"
                required
                value={contactForm.org}
                onChange={e => setContactForm({ ...contactForm, org: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 text-sm mb-6"
                style={{ border: '1px solid #dddddd', outline: 'none', background: '#fafafa' }}
                placeholder="Your university or company"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setContactForm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-0"
                  style={{ background: '#f2f2f2', color: '#484848' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-0"
                  style={{ background: '#ff385c', color: '#ffffff' }}
                >
                  Send request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success message */}
        {submitted && (
          <div className="text-center rounded-2xl p-8 mb-10" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-lg font-semibold mb-1" style={{ color: '#166534' }}>Request sent</p>
            <p className="text-sm" style={{ color: '#15803d' }}>
              We'll be in touch at {contactForm?.email} within 24 hours.
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium hover:underline cursor-pointer bg-transparent border-0"
            style={{ color: '#6a6a6a' }}
          >
            ← Go back
          </button>
          {!user && (
            <p className="text-xs mt-3" style={{ color: '#aaaaaa' }}>
              Already have an account?{' '}
              <a href="/" className="underline font-medium" style={{ color: '#ff385c' }}>
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
