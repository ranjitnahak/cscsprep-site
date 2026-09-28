/**
 * My Journey — image placeholders, question ladder, WhatsApp modal.
 */

const MJ_QUESTION_COUNT = 5;

const answers = Array(MJ_QUESTION_COUNT).fill(null);
let modalDismissed = false;
let modalOpen = false;
let modalTriggerTimeout = null;
let lastFocusedBeforeModal = null;

function buildWhatsAppUrl() {
  const yesCount = answers.filter((a) => a === 'yes').length;
  const text =
    `Hi Ranjit! I just went through your journey. Yes, I'm ready to crack the CSCS. 💪\n` +
    `(My answers: ${yesCount}/5 yes)`;
  const number = CSCS_CONFIG.ranjitWhatsAppNumber || '919686476851';
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function updateWhatsAppLinks() {
  const url = buildWhatsAppUrl();
  const modalLink = document.getElementById('mj-modal-whatsapp');
  const fallbackLink = document.getElementById('mj-whatsapp-fallback');
  if (modalLink) modalLink.href = url;
  if (fallbackLink) fallbackLink.href = url;
}

function answeredCount() {
  return answers.filter((a) => a !== null).length;
}

function allAnswered() {
  return answeredCount() === MJ_QUESTION_COUNT;
}

function updateProgress() {
  const el = document.getElementById('mj-progress');
  if (!el) return;
  const count = answeredCount();
  el.textContent = `${count} of ${MJ_QUESTION_COUNT} answered`;
}

function setQuestionUI(questionIndex, value) {
  const card = document.querySelector(`.mj-q-card[data-question="${questionIndex}"]`);
  if (!card) return;

  card.querySelectorAll('.mj-q-btn').forEach((btn) => {
    const isSelected = btn.dataset.answer === value;
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    btn.classList.remove('is-yes', 'is-no');
    if (isSelected) {
      btn.classList.add(value === 'yes' ? 'is-yes' : 'is-no');
    }
  });
}

function scheduleModalIfComplete() {
  if (modalTriggerTimeout) {
    clearTimeout(modalTriggerTimeout);
    modalTriggerTimeout = null;
  }

  if (!allAnswered() || modalDismissed) return;

  modalTriggerTimeout = setTimeout(() => {
    modalTriggerTimeout = null;
    if (allAnswered() && !modalDismissed && !modalOpen) {
      openModal();
    }
  }, 400);
}

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

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hidden && el.offsetParent !== null);
}

function openModal() {
  const modal = document.getElementById('mj-modal');
  const panel = modal?.querySelector('.mj-modal-panel');
  if (!modal || !panel) return;

  lastFocusedBeforeModal = document.activeElement;
  modal.removeAttribute('hidden');
  modal.classList.add('is-open');
  modalOpen = true;
  document.body.classList.add('nav-open');

  const closeBtn = document.getElementById('mj-modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const modal = document.getElementById('mj-modal');
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('hidden', '');
  modalOpen = false;
  modalDismissed = true;
  document.body.classList.remove('nav-open');

  const fallback = document.getElementById('mj-whatsapp-fallback');
  if (fallback && allAnswered()) {
    fallback.hidden = false;
  }

  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus();
  }
}

function initModal() {
  const modal = document.getElementById('mj-modal');
  const backdrop = document.getElementById('mj-modal-backdrop');
  const closeBtn = document.getElementById('mj-modal-close');
  const panel = modal?.querySelector('.mj-modal-panel');

  if (!modal || !panel) return;

  closeBtn?.addEventListener('click', () => closeModal());

  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modalOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusables = getFocusableElements(panel);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function initQuestions() {
  const container = document.getElementById('mj-questions');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.mj-q-btn');
    if (!btn) return;

    const card = btn.closest('.mj-q-card');
    if (!card) return;

    const questionIndex = Number(card.dataset.question);
    const value = btn.dataset.answer;
    if (Number.isNaN(questionIndex) || (value !== 'yes' && value !== 'no')) return;

    answers[questionIndex] = value;
    setQuestionUI(questionIndex, value);
    updateProgress();
    updateWhatsAppLinks();

    if (allAnswered()) {
      scheduleModalIfComplete();
    } else if (modalTriggerTimeout) {
      clearTimeout(modalTriggerTimeout);
      modalTriggerTimeout = null;
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
  initQuestions();
  initModal();
  initScrollReveal();
  updateProgress();
  updateWhatsAppLinks();
});
