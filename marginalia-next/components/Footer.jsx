import Link from 'next/link';

const LogoIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5c4.5-1.8 9-1.2 13 2 4-3.2 8.5-3.8 13-2v16c-4.5-1.8-9-1.2-13 2-4-3.2-8.5-3.8-13-2z" />
    <path d="M16 10.5v16" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer wrap" id="contact">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="logo" href="/" aria-label="NIVANT, back to home page">
            <LogoIcon />
            NIVANT.
          </Link>
          <p>A place where you can relax, find peace, and build something of your own.</p>
        </div>
        <div>
          <h3>Navigation</h3>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/#contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3>Visit</h3>
          <p>Open daily, 10 am to 8 pm</p>
        </div>
        <div>
          <h3>Say hello</h3>
          <ul>
            <li><a href="mailto:hello@nivant.app">hello@nivant.app</a></li>
            <li><Link href="/#contact">Instagram</Link></li>
            <li><Link href="/#letter">The Sunday letter</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NIVANT</span>
        <span>Made with care & peace.</span>
      </div>
    </footer>
  );
}
