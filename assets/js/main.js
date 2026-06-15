// CSCS Prep — main.js

const NAV_HTML = `
<div class="nav-top-bar"></div>
<header class="nav-bar">
  <div class="nav-inner">
    <a href="/" class="nav-logo">CSCS <span class="nav-logo-prep">PREP</span></a>
    <nav class="nav-links" aria-label="Main navigation">
      <a href="/question-of-the-day">Question of the Day</a>
      <a href="/blog">Blog</a>
      <a href="#">Products</a>
      <a href="#">About</a>
      <a href="#">Free Resources</a>
    </nav>
    <a href="#" class="nav-cta">ENROL NOW →</a>
    <button class="nav-hamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-overlay">☰</button>
  </div>
</header>
<div class="nav-overlay" id="nav-overlay" aria-hidden="true">
  <button class="nav-overlay-close" type="button" aria-label="Close menu">×</button>
  <nav class="nav-overlay-links" aria-label="Mobile navigation">
    <a href="/question-of-the-day">Question of the Day</a>
    <a href="/blog">Blog</a>
    <a href="#">Products</a>
    <a href="#">About</a>
    <a href="#">Free Resources</a>
    <a href="#" class="nav-cta">ENROL NOW →</a>
  </nav>
</div>
`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="/" class="footer-logo">CSCS <span class="footer-logo-prep">PREP</span></a>
      <p class="footer-tagline">India's most structured CSCS preparation. Built by a CSCS, for CSCS candidates.</p>
    </div>
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Products</h4>
        <ul>
          <li><a href="#">CSCS Fast Track</a></li>
          <li><a href="#">Question Bank</a></li>
          <li><a href="#">Exam Simulator</a></li>
          <li><a href="#">Study Guide</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Free Resources</h4>
        <ul>
          <li><a href="/question-of-the-day">Question of the Day</a></li>
          <li><a href="#">Blood Test for CSCS</a></li>
          <li><a href="#">Free Chapter 1 Notes</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About Ranjit</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Use</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <ul>
          <li><a href="#">Instagram @cscsprep</a></li>
          <li><a href="#">Free WhatsApp Group</a></li>
          <li><a href="#">Book a Clarity Call</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 CSCS Prep · Ranjit Nahak, MSc, CSCS · sportsscienceuniversity.com</span>
      <div class="footer-bottom-right">
        <a href="#">@cscsprep</a>
        <span class="sep">·</span>
        <a href="#">Privacy Policy</a>
        <span class="sep">·</span>
        <a href="#">Terms of Use</a>
      </div>
    </div>
  </div>
</footer>
`;

function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.getElementById('nav-overlay');
  const closeBtn = document.querySelector('.nav-overlay-close');

  if (!hamburger || !overlay) return;

  function openMenu() {
    overlay.classList.add('is-open');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  overlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-placeholder')?.insertAdjacentHTML('beforeend', NAV_HTML);
  document.getElementById('footer-placeholder')?.insertAdjacentHTML('beforeend', FOOTER_HTML);
  initMobileNav();
});
