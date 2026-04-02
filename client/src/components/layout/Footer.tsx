import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #ebebeb', background: '#f7f7f7' }}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: '#6a6a6a' }}>
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
          {' '}· AI matching powered by Claude
        </span>
        <div className="flex items-center gap-4">
          <Link to="/credits" className="no-underline hover:underline" style={{ color: '#6a6a6a' }}>
            Pricing
          </Link>
          <span>© {new Date().getFullYear()} CORDIS Explorer</span>
        </div>
      </div>
    </footer>
  );
}
