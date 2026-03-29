export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span>
          Data from{' '}
          <a
            href="https://cordis.europa.eu/datalab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-eu-blue-lighter)] hover:underline"
          >
            CORDIS EURIO Knowledge Graph
          </a>
        </span>
        <span>No API key required</span>
      </div>
    </footer>
  );
}
