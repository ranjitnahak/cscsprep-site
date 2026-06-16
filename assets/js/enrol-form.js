// CSCS Prep — enrol-form.js

(function () {
  const TOTAL_STEPS = 8;
  const TRANSITION_MS = 350;
  const CARD_ADVANCE_MS = 300;

  const ERROR_MESSAGES = {
    1: 'Please enter your name',
    2: 'Please enter a valid email address',
    3: 'Please enter your phone number',
    4: 'Please enter your city',
    5: 'Please enter your current role',
    6: "Please enter your certifications (or 'None')",
  };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const form = document.getElementById('enrol-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.enrol-form-step'));
  const progressFill = document.getElementById('enrol-progress-fill');
  const stepCount = document.getElementById('enrol-step-count');
  const backBtn = document.getElementById('enrol-back');
  const submitBtn = document.getElementById('enrol-submit');
  const submitError = document.getElementById('enrol-submit-error');

  let currentStep = 1;
  let isTransitioning = false;
  let isSubmitting = false;
  let attemptedCscs = null;
  let biggestChallenge = null;

  function getInputForStep(step) {
    const stepEl = steps.find((s) => Number(s.dataset.step) === step);
    return stepEl?.querySelector('.enrol-form-input') ?? null;
  }

  function getErrorEl(step) {
    return document.getElementById(`enrol-error-${step}`);
  }

  function clearError(step) {
    const errorEl = getErrorEl(step);
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function showError(step, message) {
    const errorEl = getErrorEl(step);
    const input = getInputForStep(step);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    if (input) {
      input.classList.add('is-shaking');
      setTimeout(() => input.classList.remove('is-shaking'), 300);
    }
  }

  function validateStep(step) {
    clearError(step);

    if (step === 7 || step === 8) return true;

    const input = getInputForStep(step);
    if (!input) return true;

    const value = input.value.trim();

    if (step === 2) {
      if (!EMAIL_REGEX.test(value)) {
        showError(step, ERROR_MESSAGES[2]);
        return false;
      }
      return true;
    }

    if (!value) {
      showError(step, ERROR_MESSAGES[step]);
      return false;
    }

    return true;
  }

  function updateProgress(step) {
    const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
    progressFill.style.width = `${pct}%`;
    stepCount.textContent = `${step} of ${TOTAL_STEPS}`;
    backBtn.hidden = step === 1;
  }

  function focusStepInput(step) {
    const input = getInputForStep(step);
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  }

  function goToStep(nextStep) {
    if (isTransitioning || nextStep < 1 || nextStep > TOTAL_STEPS || nextStep === currentStep) {
      return;
    }

    isTransitioning = true;
    const outgoing = steps.find((s) => Number(s.dataset.step) === currentStep);
    const incoming = steps.find((s) => Number(s.dataset.step) === nextStep);

    outgoing?.classList.add('is-exiting');
    outgoing?.classList.remove('is-active');

    setTimeout(() => {
      outgoing?.classList.remove('is-exiting');
      incoming?.classList.add('is-active', 'is-entering');

      currentStep = nextStep;
      updateProgress(nextStep);
      focusStepInput(nextStep);

      requestAnimationFrame(() => {
        incoming?.classList.remove('is-entering');
        isTransitioning = false;
      });
    }, TRANSITION_MS);
  }

  function advanceFromTextStep(step) {
    if (!validateStep(step)) return;
    goToStep(step + 1);
  }

  function selectCard(card, step) {
    const container = card.closest('.enrol-form-cards');
    container?.querySelectorAll('.enrol-form-card').forEach((c) => c.classList.remove('is-selected'));
    card.classList.add('is-selected');

    if (step === 7) {
      attemptedCscs = card.dataset.value === 'yes';
      setTimeout(() => goToStep(8), CARD_ADVANCE_MS);
    } else if (step === 8) {
      biggestChallenge = card.dataset.value;
      submitBtn.hidden = false;
    }
  }

  function buildPayload() {
    return {
      name: document.getElementById('enrol-name').value.trim(),
      email: document.getElementById('enrol-email').value.trim(),
      phone: document.getElementById('enrol-phone').value.trim(),
      city: document.getElementById('enrol-city').value.trim(),
      role: document.getElementById('enrol-role').value.trim(),
      certifications: document.getElementById('enrol-certifications').value.trim(),
      attempted_cscs: attemptedCscs,
      biggest_challenge: biggestChallenge,
      source: 'enrol-form',
    };
  }

  function setSubmitLoading(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.innerHTML = '<span class="enrol-form-spinner"></span> Submitting...';
      submitBtn.classList.add('is-loading');
    } else {
      submitBtn.textContent = 'Submit →';
      submitBtn.classList.remove('is-loading');
    }
  }

  async function submitForm() {
    if (isSubmitting || !biggestChallenge) return;

    submitError.hidden = true;
    submitError.textContent = '';
    setSubmitLoading(true);

    try {
      const res = await fetch(CSCS_CONFIG.enrolLeadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/enrol/thank-you';
        return;
      }

      throw new Error(data.error || 'Submission failed');
    } catch {
      setSubmitLoading(false);
      submitError.textContent = 'Something went wrong. Please try again.';
      submitError.hidden = false;
    }
  }

  form.querySelectorAll('.enrol-form-ok').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = Number(btn.closest('.enrol-form-step')?.dataset.step);
      advanceFromTextStep(step);
    });
  });

  form.querySelectorAll('.enrol-form-step[data-step="7"] .enrol-form-card').forEach((card) => {
    card.addEventListener('click', () => selectCard(card, 7));
  });

  form.querySelectorAll('.enrol-form-step[data-step="8"] .enrol-form-card').forEach((card) => {
    card.addEventListener('click', () => selectCard(card, 8));
  });

  submitBtn?.addEventListener('click', submitForm);

  backBtn?.addEventListener('click', () => {
    if (currentStep === 8) {
      submitBtn.hidden = true;
      submitError.hidden = true;
      form.querySelectorAll('.enrol-form-step[data-step="8"] .enrol-form-card').forEach((c) => {
        c.classList.remove('is-selected');
      });
      biggestChallenge = null;
    }
    if (currentStep === 7) {
      attemptedCscs = null;
      form.querySelectorAll('.enrol-form-step[data-step="7"] .enrol-form-card').forEach((c) => {
        c.classList.remove('is-selected');
      });
    }
    goToStep(currentStep - 1);
  });

  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    if (currentStep >= 1 && currentStep <= 6) {
      e.preventDefault();
      advanceFromTextStep(currentStep);
    } else if (currentStep === 8 && !submitBtn.hidden) {
      e.preventDefault();
      submitForm();
    }
  });

  form.querySelectorAll('.enrol-form-input').forEach((input) => {
    input.addEventListener('input', () => {
      const step = Number(input.closest('.enrol-form-step')?.dataset.step);
      clearError(step);
    });
  });

  updateProgress(1);
})();
