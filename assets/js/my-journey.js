/**
 * My Journey — image placeholders, question stepper, scroll reveal.
 */

const MJ_QUESTION_COUNT = 5;

const MJ_QUESTIONS = [
  'Do you want to work with athletes, not just gym clients?',
  'Do you want a credential that gets you taken seriously, in India and abroad?',
  'Are you tired of learning in bits and pieces from YouTube and random courses?',
  'Would you put in 16 focused weeks if you knew exactly what to study?',
  'Are you ready to stop thinking about the CSCS and start doing it?',
];

const WA_SVG =
  '<svg class="mj-step-wa-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
  '</svg>';

const answers = Array(MJ_QUESTION_COUNT).fill(null);
let screen = 0;
let advanceLock = false;
let transitionDir = 'forward';
let advanceTimeout = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function yesCount() {
  return answers.filter((a) => a === 'yes').length;
}

function buildWhatsAppUrl() {
  const count = yesCount();
  const text =
    `Hi Ranjit! I just went through your journey. Yes, I'm ready to crack the CSCS. 💪\n` +
    `(My answers: ${count}/5 yes)`;
  const number = CSCS_CONFIG.ranjitWhatsAppNumber || '919686476851';
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function progressBarHtml(allDone) {
  const segments = Array.from({ length: MJ_QUESTION_COUNT }, (_, i) => {
    const done = allDone || answers[i] !== null;
    return `<span class="mj-step-progress-seg${done ? ' is-done' : ''}" aria-hidden="true"></span>`;
  }).join('');
  return `<div class="mj-step-progress" role="presentation">${segments}</div>`;
}

function renderStartScreen() {
  return `
    <div class="mj-step-screen${transitionClass()}">
      <h2 class="mj-step-heading" tabindex="-1">5 questions. Answer honestly.</h2>
      <p class="mj-step-sub">Takes 30 seconds. Then send your answers to Ranjit.</p>
      <button type="button" class="mj-step-btn mj-step-btn--start" id="mj-step-start">START →</button>
    </div>
  `;
}

function renderQuestionScreen(questionNum) {
  const qIndex = questionNum - 1;
  const current = answers[qIndex];
  const yesSelected = current === 'yes';
  const noSelected = current === 'no';
  const backLink =
    questionNum >= 2
      ? `<div class="mj-step-footer"><button type="button" class="mj-step-link" data-action="back">← Back</button></div>`
      : '';

  return `
    <div class="mj-step-screen${transitionClass()}">
      ${progressBarHtml(false)}
      <p class="mj-step-label" tabindex="-1">QUESTION ${questionNum} OF 5</p>
      <p class="mj-step-question">${MJ_QUESTIONS[qIndex]}</p>
      <div class="mj-step-actions">
        <button type="button" class="mj-step-btn mj-step-btn--answer mj-step-btn--yes${yesSelected ? ' is-selected' : ''}" data-answer="yes" aria-pressed="${yesSelected}">YES</button>
        <button type="button" class="mj-step-btn mj-step-btn--answer mj-step-btn--no${noSelected ? ' is-selected' : ''}" data-answer="no" aria-pressed="${noSelected}">NO</button>
      </div>
      ${backLink}
    </div>
  `;
}

function renderResultScreen() {
  const count = yesCount();
  return `
    <div class="mj-step-screen${transitionClass()}">
      ${progressBarHtml(true)}
      <p class="mj-step-label" tabindex="-1">${count}/5 YES</p>
      <h2 class="mj-step-heading mj-step-heading--result">Yes, I'm ready to crack the CSCS.</h2>
      <p class="mj-step-sub">Now tell Ranjit.</p>
      <button type="button" class="mj-step-btn mj-step-btn--wa" id="mj-step-whatsapp">
        ${WA_SVG}
        Share with Ranjit on WhatsApp
      </button>
      <button type="button" class="mj-step-link mj-step-link--change" data-action="reset">Change my answers</button>
    </div>
  `;
}

function transitionClass() {
  if (prefersReducedMotion()) return '';
  return transitionDir === 'back' ? ' is-enter-back' : ' is-enter-forward';
}

function renderScreen() {
  const live = document.getElementById('mj-stepper-live');
  if (!live) return;

  let html;
  if (screen === 0) {
    html = renderStartScreen();
  } else if (screen >= 1 && screen <= 5) {
    html = renderQuestionScreen(screen);
  } else {
    html = renderResultScreen();
  }

  live.innerHTML = html;
  focusScreenHeading(live);
}

function focusScreenHeading(live) {
  requestAnimationFrame(() => {
    const target =
      live.querySelector('.mj-step-label[tabindex="-1"]') ||
      live.querySelector('.mj-step-heading[tabindex="-1"]');
    if (target) {
      target.focus({ preventScroll: true });
    }
  });
}

function goToScreen(nextScreen, dir) {
  transitionDir = dir;
  screen = nextScreen;
  renderScreen();
}

function selectAnswer(value) {
  if (advanceLock || screen < 1 || screen > 5) return;
  if (value !== 'yes' && value !== 'no') return;

  const qIndex = screen - 1;
  answers[qIndex] = value;
  advanceLock = true;

  const live = document.getElementById('mj-stepper-live');
  if (live) {
    live.querySelectorAll('.mj-step-btn--answer').forEach((btn) => {
      const selected = btn.dataset.answer === value;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    live.querySelectorAll('.mj-step-progress-seg').forEach((seg, i) => {
      if (i <= qIndex) seg.classList.add('is-done');
    });
  }

  if (advanceTimeout) clearTimeout(advanceTimeout);
  advanceTimeout = setTimeout(() => {
    advanceTimeout = null;
    advanceLock = false;
    if (screen === 5) {
      goToScreen(6, 'forward');
    } else {
      goToScreen(screen + 1, 'forward');
    }
  }, 380);
}

function resetStepper() {
  if (advanceTimeout) {
    clearTimeout(advanceTimeout);
    advanceTimeout = null;
  }
  advanceLock = false;
  answers.fill(null);
  goToScreen(0, 'back');
}

function initStepper() {
  const stepper = document.getElementById('mj-stepper');
  if (!stepper) return;

  stepper.addEventListener('click', (e) => {
    const startBtn = e.target.closest('#mj-step-start');
    if (startBtn) {
      goToScreen(1, 'forward');
      return;
    }

    const answerBtn = e.target.closest('[data-answer]');
    if (answerBtn) {
      selectAnswer(answerBtn.dataset.answer);
      return;
    }

    const backBtn = e.target.closest('[data-action="back"]');
    if (backBtn) {
      if (advanceLock) return;
      goToScreen(screen - 1, 'back');
      return;
    }

    const resetBtn = e.target.closest('[data-action="reset"]');
    if (resetBtn) {
      resetStepper();
      return;
    }

    const waBtn = e.target.closest('#mj-step-whatsapp');
    if (waBtn) {
      window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (screen < 1 || screen > 5 || advanceLock) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

    const key = e.key.toLowerCase();
    if (key === 'y') {
      e.preventDefault();
      selectAnswer('yes');
    } else if (key === 'n') {
      e.preventDefault();
      selectAnswer('no');
    }
  });

  renderScreen();
}

/** All .mj-figure img on the page (my-journey/ and coach/ paths) — initFigures() handles load/fallback. */
function initFigures() {
  document.querySelectorAll('.mj-figure img').forEach((img) => {
    const figure = img.closest('.mj-figure');
    if (!figure) return;

    const markLoaded = () => {
      if (img.naturalWidth > 0) {
        figure.classList.add('is-loaded');
      }
    };

    const markMissing = () => {
      figure.classList.remove('is-loaded');
    };

    img.addEventListener('load', markLoaded);
    img.addEventListener('error', markMissing);

    if (img.complete) {
      if (img.naturalWidth > 0) {
        markLoaded();
      } else {
        markMissing();
      }
    }
  });
}

function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.mj-reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  document.querySelectorAll('.mj-reveal').forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initFigures();
  initStepper();
  initScrollReveal();
});
