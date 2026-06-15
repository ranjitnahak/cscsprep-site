// CSCS Prep — main.js

function getCohortDate() {
  return new Date(CSCS_CONFIG.cohortDate);
}

function formatCohortDateShort() {
  return getCohortDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function formatCohortDateFull() {
  return getCohortDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

function getDaysLeft(date) {
  const days = Math.ceil((date - new Date()) / 86400000);
  return Math.max(0, days);
}

function getNavHtml() {
  const { enrolLink } = CSCS_CONFIG;
  return `
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
    <a href="${enrolLink}" class="nav-cta">ENROL NOW →</a>
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
    <a href="${enrolLink}" class="nav-cta">ENROL NOW →</a>
  </nav>
</div>
`;
}

function getFooterHtml() {
  const { instagramUrl, whatsappLink, calLink, privacyUrl, termsUrl } = CSCS_CONFIG;
  return `
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
          <li><a href="${privacyUrl}">Privacy Policy</a></li>
          <li><a href="${termsUrl}">Terms of Use</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <ul>
          <li><a href="${instagramUrl}">Instagram @cscsprep</a></li>
          <li><a href="${whatsappLink}">Free WhatsApp Group</a></li>
          <li><a href="${calLink}">Book a Clarity Call</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 CSCS Prep · Ranjit Nahak, MSc, CSCS · sportsscienceuniversity.com</span>
      <div class="footer-bottom-right">
        <a href="${instagramUrl}">@cscsprep</a>
        <span class="sep">·</span>
        <a href="${privacyUrl}">Privacy Policy</a>
        <span class="sep">·</span>
        <a href="${termsUrl}">Terms of Use</a>
      </div>
    </div>
  </div>
</footer>
`;
}

function applyCscsConfig() {
  const { cohortLabel } = CSCS_CONFIG;
  const labelUpper = cohortLabel.toUpperCase();

  document.querySelectorAll('[data-cscs-href]').forEach((el) => {
    const key = el.dataset.cscsHref;
    if (CSCS_CONFIG[key]) {
      el.href = CSCS_CONFIG[key];
    }
  });

  const cohortDateLabel = document.getElementById('cohort-date-label');
  if (cohortDateLabel) {
    cohortDateLabel.textContent = formatCohortDateShort();
  }

  const heroEnrolBtn = document.getElementById('hero-enrol-btn');
  if (heroEnrolBtn) {
    heroEnrolBtn.textContent = `ENROL IN THE ${labelUpper} →`;
  }

  const finalCtaPre = document.getElementById('final-cta-pre');
  if (finalCtaPre) {
    finalCtaPre.textContent = `LIMITED SEATS · ${labelUpper}`;
  }

  const finalCtaHeading = document.getElementById('final-cta-heading');
  if (finalCtaHeading) {
    finalCtaHeading.textContent = `The ${cohortLabel} is filling up.`;
  }
}

function initEnrolPage() {
  const page = document.querySelector('.enrol-page');
  if (!page) return;

  const cohortLabel = document.getElementById('enrol-cohort-label');
  if (cohortLabel) {
    cohortLabel.textContent = CSCS_CONFIG.cohortLabel;
  }

  const startDate = document.getElementById('enrol-start-date');
  if (startDate) {
    startDate.textContent = formatCohortDateFull();
  }
}

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

function initCohortBar() {
  const bar = document.getElementById('cohort-bar');
  const daysEl = document.getElementById('cohort-days');
  const dismissBtn = document.querySelector('.cohort-bar-dismiss');

  if (!bar || !daysEl) return;

  if (sessionStorage.getItem('cohort-bar-dismissed') === '1') {
    bar.classList.add('is-hidden');
    return;
  }

  const days = getDaysLeft(getCohortDate());

  if (days === 0) {
    bar.classList.add('is-hidden');
    return;
  }

  daysEl.textContent = days;

  dismissBtn?.addEventListener('click', () => {
    bar.classList.add('is-hidden');
    sessionStorage.setItem('cohort-bar-dismissed', '1');
  });
}

function initStatsCounter() {
  const section = document.querySelector('.stats-ticker');
  if (!section) return;

  const items = section.querySelectorAll('.stat-item');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateStat(item) {
    const target = parseInt(item.dataset.target, 10);
    const suffix = item.dataset.suffix || '';
    const numberEl = item.querySelector('.stat-number');
    if (!numberEl || Number.isNaN(target)) return;

    if (prefersReducedMotion) {
      numberEl.textContent = target + suffix;
      return;
    }

    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const value = Math.round(eased * target);
      numberEl.textContent = value + suffix;

      if (t < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        items.forEach(animateStat);
        observer.unobserve(section);
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);
}

const QOTD_ENDPOINT = 'https://ehvuneluhyxpoiucyigw.supabase.co/functions/v1/qotd';

async function initQOTDTeaser() {
  const section = document.getElementById('qotd-teaser');
  if (!section) return;

  const skeleton = section.querySelector('.qotd-skeleton');
  const loaded = section.querySelector('.qotd-loaded');

  function hideSection() {
    section.classList.add('is-hidden');
  }

  try {
    const res = await fetch(QOTD_ENDPOINT);
    const data = await res.json();

    if (!res.ok || data.error) {
      hideSection();
      return;
    }

    section.querySelector('.qotd-chapter-badge').textContent =
      `CHAPTER ${data.chapter_number} · ${data.chapter_title}`;
    section.querySelector('.qotd-domain-pill').textContent = data.domain;
    section.querySelector('.qotd-question').textContent = data.question_text;

    const optionsEl = section.querySelector('.qotd-options');
    optionsEl.innerHTML = '';
    (data.options || []).forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qotd-option';
      btn.disabled = true;
      btn.innerHTML = `<span class="qotd-option-letter">${opt.id}</span><span class="qotd-option-text">${opt.text}</span>`;
      optionsEl.appendChild(btn);
    });

    skeleton?.classList.add('is-hidden');
    loaded.hidden = false;
  } catch {
    hideSection();
  }
}

function initFinalCta() {
  const section = document.getElementById('final-cta');
  if (!section) return;

  const days = getDaysLeft(getCohortDate());
  const subEl = document.getElementById('final-cta-sub');
  const daysEl = document.getElementById('final-cta-days');

  if (days === 0) {
    section.classList.add('is-waitlist');
    if (subEl) subEl.textContent = 'Applications open for the next cohort. Join the waitlist.';
  } else if (daysEl) {
    daysEl.textContent = days;
  }
}

function initCoachSlideshow() {
  const slidesContainer = document.querySelector('.meet-coach-slideshow-slides');
  const captionEl = document.querySelector('.meet-coach-slideshow-caption');
  const dotsContainer = document.querySelector('.meet-coach-slideshow-dots');
  if (!slidesContainer || !captionEl || !dotsContainer) return;

  const slides = [
    { src: '/assets/images/coach/coach-1.jpg', caption: 'S&C Coach, Pretoria Capitals — SA T20 League' },
    { src: '/assets/images/coach/coach-2.jpg', caption: 'Haryana Steelers, Pro Kabaddi League Season 10' },
    { src: '/assets/images/coach/coach-3.jpg', caption: 'Soorma Hockey Club — Hockey India League' },
    { src: '/assets/images/coach/coach-4.jpg', caption: 'TEDx Speaker' },
    { src: '/assets/images/coach/coach-5.jpg', caption: 'Presenting at NSCA India — GPS Data Analysis' },
    { src: '/assets/images/coach/coach-6.jpg', caption: 'S&C Masterclass, NIS Patiala — Boxing Federation' },
    { src: '/assets/images/coach/coach-7.jpg', caption: 'Guest Lecture, DY Patil University' },
    { src: '/assets/images/coach/coach-8.jpg', caption: 'Sports Tech & Data Analytics, IIT Delhi' },
  ];

  function preloadSlide(slide) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(slide);
      img.onerror = () => resolve(null);
      img.src = slide.src;
    });
  }

  Promise.all(slides.map(preloadSlide)).then((results) => {
    const validSlides = results.filter(Boolean);
    if (validSlides.length === 0) {
      slidesContainer.closest('.meet-coach-slideshow')?.remove();
      return;
    }

    const slideEls = validSlides.map((slide) => {
      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.caption;
      slidesContainer.appendChild(img);
      return img;
    });

    const dotEls = validSlides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'meet-coach-slideshow-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dotsContainer.appendChild(dot);
      return dot;
    });

    let current = 0;

    function goTo(index) {
      slideEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
      dotEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
      captionEl.textContent = validSlides[index].caption;
      current = index;
    }

    goTo(0);
    setInterval(() => goTo((current + 1) % validSlides.length), 4000);
  });
}

function initFAQ() {
  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;

  accordion.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-question');
    if (!trigger) return;

    const item = trigger.closest('.faq-item');
    const wasOpen = item.classList.contains('is-open');

    accordion.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
      openItem.classList.remove('is-open');
      openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyCscsConfig();
  document.getElementById('nav-placeholder')?.insertAdjacentHTML('beforeend', getNavHtml());
  document.getElementById('footer-placeholder')?.insertAdjacentHTML('beforeend', getFooterHtml());
  initMobileNav();
  initCohortBar();
  initFinalCta();
  initEnrolPage();
  initStatsCounter();
  initQOTDTeaser();
  initFAQ();
  initCoachSlideshow();
});
