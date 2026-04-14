const links = [
  { label: "Docs", href: "https://docs.punk.domains/" },
  { label: "GitHub", href: "https://github.com/punk-domains-2" },
  { label: "GitLab", href: "https://gitlab.com/punk-domains" },
  { label: "Discord", href: "https://discord.gg/8dSrwrAQeu" },
  { label: "X", href: "https://x.com/PunkDomains/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">Punk Domains</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
