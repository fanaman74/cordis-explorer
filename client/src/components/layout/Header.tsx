import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_EMAIL = 'fredanaman@proton.me';

export default function Header() {
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #ebebeb',
        boxShadow: 'rgba(0,0,0,0.04) 0px 1px 0px, rgba(0,0,0,0.04) 0px 2px 6px',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ background: '#ff385c' }}
          >
            EU
          </div>
          <span
            className="text-base font-semibold"
            style={{ color: '#222222', letterSpacing: '-0.18px' }}
          >
            CORDIS Explorer
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://cordis.europa.eu/datalab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium no-underline transition-colors duration-200 hidden sm:block"
            style={{ color: '#6a6a6a' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#222222')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#6a6a6a')}
          >
            About
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs hidden sm:block max-w-[140px] truncate" style={{ color: '#6a6a6a' }}>
                {user.email}
              </span>
              {user.email === ADMIN_EMAIL && (
                <Link
                  to="/admin"
                  className="btn-secondary btn-sm btn-pill no-underline"
                  style={{ height: '32px', fontSize: '12px', color: '#e00b41', borderColor: 'rgba(224,11,65,0.3)' }}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={signOut}
                className="btn-secondary btn-sm btn-pill"
                style={{ height: '32px', fontSize: '13px' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-primary btn-sm btn-pill"
              style={{ height: '36px' }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
