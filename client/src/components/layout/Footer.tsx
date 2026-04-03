import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #ebebeb', background: '#f7f7f7' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5 text-sm" aria-label="Footer navigation">
          <Link to="/search" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Browse Projects</Link>
          <Link to="/grant-search" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Grant Search</Link>
          <Link to="/grant-match" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>GrantMatch</Link>
          <Link to="/partner-match" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Partner Match</Link>
          <Link to="/graph" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Knowledge Graph</Link>
          <Link to="/map" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Map</Link>
          <Link to="/pricing" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>Pricing</Link>
        </nav>

        {/* Attribution + copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: '#6a6a6a' }}>
          <span>
            Data from{' '}
            <a
              href="https://cordis.europa.eu/datalab"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium no-underline hover:underline"
              style={{ color: '#ff385c' }}
            >
              CORDIS EURIO Knowledge Graph
            </a>
            {' '}&middot; AI matching powered by Claude
          </span>
          <span>&copy; {new Date().getFullYear()} CORDIS Explorer</span>
        </div>
      </div>
    </footer>
  );
}
