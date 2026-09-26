const LogoIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5c4.5-1.8 9-1.2 13 2 4-3.2 8.5-3.8 13-2v16c-4.5-1.8-9-1.2-13 2-4-3.2-8.5-3.8-13-2z" /><path d="M16 10.5v16" /></svg>
);

export default function Footer() {
  return (
    <footer className="footer wrap" id="contact">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="logo" href="#top" aria-label="Marginalia, back to top">
            <LogoIcon />
            Marginalia.
          </a>
          <p>An independent bookshop for slow readers, fast readers and everyone in between.</p>
        </div>
        <div><h3>Visit</h3><p>14 Linden Row<br />Open daily, 10 am to 8 pm</p></div>
        <div><h3>Shop</h3><ul><li><a href="#store">New arrivals</a></li><li><a href="#collections">This month's pick</a></li><li><a href="#store">Gift cards</a></li></ul></div>
        <div><h3>Say hello</h3><ul><li><a href="mailto:hello@marginalia.books">hello@marginalia.books</a></li><li><a href="#contact">Instagram</a></li><li><a href="#letter">The Sunday letter</a></li></ul></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Marginalia Books</span><span>Wrapped by hand, shipped with care.</span></div>
    </footer>
  );
}
