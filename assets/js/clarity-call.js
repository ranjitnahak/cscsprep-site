/**
 * Clarity Call landing — mobile nav + testimonial video wall.
 * FAQ accordion is handled by main.js initFAQ().
 * Booking links resolve via config.js applyCscsConfig() (data-cscs-href="calLink").
 */

const TESTIMONIALS = [
  {
    youtubeId: 'WzyZGUJ-H-Y',
    name: 'Anish Bali, S&C Coach',
  },
  {
    youtubeId: '3pGtRP0JcIg',
    name: 'Unnati Satre, S&C Coach',
  },
  {
    youtubeId: 'meEg3zG-kDc',
    name: 'Doneev Lama, S&C Coach',
  },
];

function youtubeEmbedUrl(id) {
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
}

function renderTestimonials() {
  const grid = document.getElementById('proof-grid');
  if (!grid) return;

  grid.innerHTML = TESTIMONIALS.map(
    (t) => `
    <article class="cc-proof-card">
      <div class="cc-video">
        <iframe
          src="${youtubeEmbedUrl(t.youtubeId)}"
          title="Testimonial from ${t.name}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <p class="cc-proof-name">${t.name}</p>
    </article>
  `
  ).join('');
}

function initClarityHeader() {
  const menuBtn = document.getElementById('cc-menu-btn');
  const mobileNav = document.getElementById('cc-mobile-nav');
  if (!menuBtn || !mobileNav) return;

  const setOpen = (open) => {
    mobileNav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('nav-open', open);
  };

  menuBtn.addEventListener('click', () => {
    setOpen(!mobileNav.classList.contains('is-open'));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTestimonials();
  initClarityHeader();
});
