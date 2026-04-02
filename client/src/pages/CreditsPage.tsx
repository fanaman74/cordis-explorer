import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
  {
    name: 'Starter',
    price: '€9',
    period: '/month',
    description: 'For individuals exploring EU funding',
    features: ['20 AI queries/month', 'All 4 matching tools', 'Email support'],
  },
  {
    name: 'Pro',
    price: '€29',
    period: '/month',
    description: 'For teams actively applying for grants',
    features: ['100 AI queries/month', 'All 4 matching tools', 'Priority support', 'Export results'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '€99',
    period: '/month',
    description: 'For organisations running multiple projects',
    features: ['500 AI queries/month', 'All 4 matching tools', 'Dedicated support', 'API access', 'Custom integrations'],
  },
];

export default function CreditsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-14" style={{ background: '#ffffff' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-5"
            style={{
              background: 'rgba(255,56,92,0.07)',
              border: '1px solid rgba(255,56,92,0.2)',
              color: '#ff385c',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Free quota reached
          </div>
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            You've used your free queries
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: '#6a6a6a' }}>
            Each tool includes 1 free AI-powered query. Upgrade to keep finding EU grants and consortium partners.
          </p>
        </div>

        {/* Tools included */}
        <div
          className="rounded-2xl p-5 mb-10 flex flex-wrap gap-4 justify-center"
          style={{
            background: '#f7f7f7',
            border: '1px solid #ebebeb',
          }}
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
              <span
                className="text-[10px] font-bold rounded-full px-1.5 py-0.5"
                style={{
                  background: 'rgba(255,56,92,0.08)',
                  color: '#ff385c',
                  border: '1px solid rgba(255,56,92,0.2)',
                }}
              >
                1 free
              </span>
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
                  <span className="text-3xl font-bold" style={{ color: '#222222', letterSpacing: '-0.44px' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: '#6a6a6a' }}>{plan.period}</span>
                </div>
                <p className="text-xs" style={{ color: '#6a6a6a' }}>{plan.description}</p>
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
                onClick={() => {
                  alert(`Payment integration coming soon. Contact us at hello@cordis-explorer.eu to upgrade to ${plan.name}.`);
                }}
              >
                Get {plan.name}
              </button>
            </div>
          ))}
        </div>

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
