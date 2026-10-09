/**
 * Before You Start — quiz modal (scoped to this page).
 */

const BY_QUIZ_HEADER = '4 QUESTIONS. ANSWER HONESTLY.';

const BY_QUESTIONS = [
  {
    left: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'starts someday.', bold: true },
      ],
      pick: false,
    },
    right: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'starts today.', bold: true },
      ],
      pick: true,
    },
    leftLabel: 'I start someday',
    rightLabel: 'I start today',
  },
  {
    left: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'follows a step-by-step process.', bold: true },
      ],
      pick: true,
    },
    right: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'goes with a random process.', bold: true },
      ],
      pick: false,
    },
    leftLabel: 'I follow a step-by-step process',
    rightLabel: 'I go with a random process',
  },
  {
    left: {
      segments: [
        { text: "When I'm stuck, ", bold: false },
        { text: 'I ask for help fast.', bold: true },
      ],
      pick: true,
    },
    right: {
      segments: [
        { text: "When I'm stuck, ", bold: false },
        { text: 'I leave it and hope it clears up.', bold: true },
      ],
      pick: false,
    },
    leftLabel: "When I'm stuck, I ask for help fast",
    rightLabel: "When I'm stuck, I leave it and hope it clears up",
  },
  {
    left: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'waits to see what happens.', bold: true },
      ],
      pick: false,
    },
    right: {
      segments: [
        { text: "I'm someone who ", bold: false },
        { text: 'invests in myself.', bold: true },
      ],
      pick: true,
    },
    leftLabel: 'I wait to see what happens',
    rightLabel: 'I invest in myself',
  },
];

const BY_STATE = {
  screen: 'start',
  picks: [null, null, null, null],
  advanceLock: false,
  lastFocus: null,
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function segmentsToHtml(segments) {
  return segments
    .map((seg) => (seg.bold ? `<strong>${seg.text}</strong>` : seg.text))
    .join('');
}

function getPickedLabels() {
  return BY_STATE.picks.map((side, i) => {
    const q = BY_QUESTIONS[i];
    return side === 'left' ? q.leftLabel : q.rightLabel;
  });
}

function allPicksGood() {
  return BY_STATE.picks.every((side, i) => {
    const q = BY_QUESTIONS[i];
    return side === 'left' ? q.left.pick : q.right.pick;
  });
}

function buildWhatsAppUrl() {
  const labels = getPickedLabels();
  const message =
    'Hi Ranjit, I just took the "Which one do you relate to?" quiz on your page.\n' +
    "Here's what I picked:\n\n" +
    `• ${labels[0]}\n` +
    `• ${labels[1]}\n` +
    `• ${labels[2]}\n` +
    `• ${labels[3]}\n\n` +
    'Wanted to share this with you.';
  const number =
    typeof CSCS_CONFIG !== 'undefined' && CSCS_CONFIG.ranjitWhatsAppNumber
      ? CSCS_CONFIG.ranjitWhatsAppNumber
      : '919686476851';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function progressHtml(filledCount) {
  const segs = Array.from({ length: 4 }, (_, i) => {
    const filled = i < filledCount ? ' is-filled' : '';
    return `<span class="by-progress-seg${filled}" aria-hidden="true"></span>`;
  }).join('');
  return `<div class="by-progress" role="presentation">${segs}</div>`;
}

function renderModal() {
  const body = document.getElementById('by-modal-body');
  if (!body) return;

  const { screen, picks } = BY_STATE;

  if (screen === 'start') {
    body.innerHTML = `
      <header class="by-modal-content">
        <h2 class="by-modal-header-title" id="by-modal-title">${BY_QUIZ_HEADER}</h2>
        <p class="by-modal-sub">Takes 30 seconds. Then send your answers to Ranjit.</p>
        <button type="button" class="by-modal-start-btn" id="by-modal-start">START →</button>
      </header>
    `;
    document.getElementById('by-modal-start')?.addEventListener('click', () => {
      BY_STATE.screen = 0;
      renderModal();
      focusFirstInModal();
    });
    return;
  }

  if (screen === 'result') {
    const labels = getPickedLabels();
    const allGood = allPicksGood();
    const title = allGood ? "THAT'S HOW YOU THINK." : "HERE'S WHAT YOU PICKED.";
    const sub = allGood ? 'Now show it.' : 'No right or wrong here. Just honest.';
    const listItems = labels.map((l) => `<li>${escapeHtml(l)}</li>`).join('');
    const waUrl = buildWhatsAppUrl();

    body.innerHTML = `
      <header class="by-modal-content">
        <h2 class="by-modal-header-title" id="by-modal-title">${title}</h2>
        <ul class="by-result-list">${listItems}</ul>
        <p class="by-result-sub">${sub}</p>
        <hr class="by-result-divider">
        <p class="by-share-heading">Want me to see this?</p>
        <a class="by-share-btn" href="${escapeAttr(waUrl)}" target="_blank" rel="noopener noreferrer">SHARE MY RESULT WITH ME →</a>
        <p class="by-share-disclosure">This opens WhatsApp with your result already written in. Nothing is sent until you press send. I read these myself.</p>
        <button type="button" class="by-start-over" id="by-start-over">Start over</button>
      </header>
    `;
    document.getElementById('by-start-over')?.addEventListener('click', resetQuiz);
    return;
  }

  const qIndex = screen;
  const q = BY_QUESTIONS[qIndex];
  const stepNum = qIndex + 1;
  const currentPick = picks[qIndex];

  body.innerHTML = `
    <header class="by-modal-content">
      <h2 class="by-modal-header-title" id="by-modal-title">${BY_QUIZ_HEADER}</h2>
      <p class="by-modal-sub">${stepNum} of 4</p>
      ${progressHtml(stepNum)}
      <div class="by-options" role="group" aria-label="Question ${stepNum}">
        <button type="button" class="by-option${currentPick === 'left' ? ' is-selected' : ''}" data-side="left">${segmentsToHtml(q.left.segments)}</button>
        <button type="button" class="by-option${currentPick === 'right' ? ' is-selected' : ''}" data-side="right">${segmentsToHtml(q.right.segments)}</button>
      </div>
      ${qIndex >= 1 ? '<button type="button" class="by-back-link" id="by-back">← Back</button>' : ''}
      <p class="by-arrow-hint">← → arrow keys work too.</p>
    </header>
  `;

  body.querySelectorAll('.by-option').forEach((btn) => {
    btn.addEventListener('click', () => handlePick(btn.dataset.side));
  });

  document.getElementById('by-back')?.addEventListener('click', () => {
    BY_STATE.screen = qIndex - 1;
    renderModal();
    focusFirstInModal();
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function handlePick(side) {
  if (BY_STATE.advanceLock) return;
  const qIndex = BY_STATE.screen;
  if (typeof qIndex !== 'number') return;

  BY_STATE.picks[qIndex] = side;

  const body = document.getElementById('by-modal-body');
  const options = body?.querySelectorAll('.by-option');
  options?.forEach((btn) => {
    btn.classList.toggle('is-selected', btn.dataset.side === side);
  });

  BY_STATE.advanceLock = true;
  const modal = document.getElementById('by-modal');
  const reduced = prefersReducedMotion();

  const advance = () => {
    if (qIndex === 3) {
      BY_STATE.screen = 'result';
    } else {
      BY_STATE.screen = qIndex + 1;
    }
    BY_STATE.advanceLock = false;
    if (modal) modal.classList.remove('by-modal-fading');
    renderModal();
    focusFirstInModal();
  };

  setTimeout(() => {
    if (reduced || !modal) {
      advance();
      return;
    }
    modal.classList.add('by-modal-fading');
    setTimeout(advance, 200);
  }, 280);
}

function resetQuiz() {
  BY_STATE.screen = 'start';
  BY_STATE.picks = [null, null, null, null];
  BY_STATE.advanceLock = false;
  renderModal();
  focusFirstInModal();
}

function getFocusable(container) {
  const sel =
    'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(sel)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

function focusFirstInModal() {
  const card = document.querySelector('.by-modal-card');
  if (!card) return;
  const focusable = getFocusable(card);
  const closeBtn = document.getElementById('by-modal-close');
  const first = focusable.find((el) => el !== closeBtn) || focusable[0] || closeBtn;
  first?.focus();
}

function handleFocusTrap(e) {
  const overlay = document.getElementById('by-modal-overlay');
  if (overlay?.hidden) return;
  if (e.key !== 'Tab') return;

  const card = document.querySelector('.by-modal-card');
  if (!card) return;

  const focusable = getFocusable(card);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function handleKeydown(e) {
  const overlay = document.getElementById('by-modal-overlay');
  if (overlay?.hidden) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
    return;
  }

  const screen = BY_STATE.screen;
  if (typeof screen !== 'number') return;

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    handlePick('left');
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    handlePick('right');
  }
}

function openModal() {
  const overlay = document.getElementById('by-modal-overlay');
  const openBtn = document.getElementById('by-quiz-open');
  if (!overlay) return;

  BY_STATE.lastFocus = openBtn || document.activeElement;
  BY_STATE.screen = 'start';
  BY_STATE.picks = [null, null, null, null];
  BY_STATE.advanceLock = false;

  overlay.hidden = false;
  document.body.classList.add('by-modal-open');
  renderModal();
  focusFirstInModal();
}

function closeModal() {
  const overlay = document.getElementById('by-modal-overlay');
  if (!overlay || overlay.hidden) return;

  overlay.hidden = true;
  document.body.classList.remove('by-modal-open');
  BY_STATE.advanceLock = false;

  const returnTo = BY_STATE.lastFocus;
  if (returnTo && typeof returnTo.focus === 'function') {
    returnTo.focus();
  }
}

function initBeforeYouStart() {
  document.getElementById('by-quiz-open')?.addEventListener('click', openModal);
  document.getElementById('by-modal-close')?.addEventListener('click', closeModal);

  document.getElementById('by-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'by-modal-overlay') {
      closeModal();
    }
  });

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keydown', handleFocusTrap);
}

document.addEventListener('DOMContentLoaded', initBeforeYouStart);
