// CSCS Prep — enrol-form.js

(function () {
  const TOTAL_STEPS = 8;
  const TRANSITION_MS = 350;
  const CARD_ADVANCE_MS = 300;

  const ERROR_MESSAGES = {
    1: 'Please enter your first name',
    1.5: 'Please enter your last name',
    2: 'Please enter a valid email address',
    3: 'Please enter your phone number',
    4: 'Please select your city',
    4.5: 'Please enter your city',
    5: 'Please select your role',
    5.5: 'Please enter your role',
    6: 'Please select your certifications',
    6.5: 'Please enter your certification',
  };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const SELECT_FIELDS = [
    { step: 4, selectId: 'enrol-city', otherWrapId: 'enrol-city-other-wrap', otherInputId: 'enrol-city-other' },
    { step: 5, selectId: 'enrol-role', otherWrapId: 'enrol-role-other-wrap', otherInputId: 'enrol-role-other' },
    { step: 6, selectId: 'enrol-certifications', otherWrapId: 'enrol-cert-other-wrap', otherInputId: 'enrol-cert-other' },
  ];

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

  function getSelectValue(selectEl, otherInputEl) {
    if (selectEl.value === 'other') return otherInputEl?.value.trim() ?? '';
    return selectEl.value;
  }

  function toggleOtherInput(selectEl, otherWrapEl) {
    const isOther = selectEl.value === 'other';
    otherWrapEl.hidden = !isOther;
    if (isOther) otherWrapEl.querySelector('input')?.focus();
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

  function shakeEl(el) {
    if (!el) return;
    el.classList.add('is-shaking');
    setTimeout(() => el.classList.remove('is-shaking'), 300);
  }

  function showError(step, message, el) {
    const errorEl = getErrorEl(step);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    shakeEl(el);
  }

  function validateNameStep() {
    clearError(1);
    const firstName = document.getElementById('enrol-first-name');
    const lastName = document.getElementById('enrol-last-name');
    const first = firstName.value.trim();
    const last = lastName.value.trim();

    if (!first) {
      showError(1, 'Please enter your first name', firstName);
      return false;
    }
    if (!last) {
      showError(1, 'Please enter your last name', lastName);
      return false;
    }
    return true;
  }

  function validateSelectStep(step, selectId, otherInputId) {
    clearError(step);
    const selectEl = document.getElementById(selectId);
    const otherInputEl = document.getElementById(otherInputId);

    if (!selectEl.value) {
      showError(step, ERROR_MESSAGES[step], selectEl);
      return false;
    }

    if (selectEl.value === 'other') {
      const otherVal = otherInputEl?.value.trim() ?? '';
      if (!otherVal) {
        const msg = step === 4 ? ERROR_MESSAGES[4.5] : step === 5 ? ERROR_MESSAGES[5.5] : ERROR_MESSAGES[6.5];
        showError(step, msg, otherInputEl);
        return false;
      }
    }

    return true;
  }

  function validateStep(step) {
    if (step === 7 || step === 8) return true;

    if (step === 1) return validateNameStep();

    if (step === 2) {
      clearError(step);
      const input = document.getElementById('enrol-email');
      if (!EMAIL_REGEX.test(input.value.trim())) {
        showError(step, ERROR_MESSAGES[2], input);
        return false;
      }
      return true;
    }

    if (step === 3) {
      clearError(step);
      const input = document.getElementById('enrol-phone');
      if (!input.value.trim()) {
        showError(step, ERROR_MESSAGES[3], input);
        return false;
      }
      return true;
    }

    if (step === 4) return validateSelectStep(4, 'enrol-city', 'enrol-city-other');
    if (step === 5) return validateSelectStep(5, 'enrol-role', 'enrol-role-other');
    if (step === 6) return validateSelectStep(6, 'enrol-certifications', 'enrol-cert-other');

    return true;
  }

  function updateProgress(step) {
    const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
    progressFill.style.width = `${pct}%`;
    stepCount.textContent = `${step} of ${TOTAL_STEPS}`;
    backBtn.hidden = step === 1;
  }

  function focusStepInput(step) {
    requestAnimationFrame(() => {
      if (step === 1) {
        const first = document.getElementById('enrol-first-name');
        const last = document.getElementById('enrol-last-name');
        if (!first.value.trim()) first.focus();
        else last.focus();
        return;
      }

      const stepEl = steps.find((s) => Number(s.dataset.step) === step);
      const select = stepEl?.querySelector('.enrol-form-select');
      if (select) {
        select.focus();
        return;
      }

      const input = stepEl?.querySelector('.enrol-form-input');
      input?.focus();
    });
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
    const firstName = document.getElementById('enrol-first-name').value.trim();
    const lastName = document.getElementById('enrol-last-name').value.trim();
    const citySelect = document.getElementById('enrol-city');
    const roleSelect = document.getElementById('enrol-role');
    const certSelect = document.getElementById('enrol-certifications');

    return {
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: document.getElementById('enrol-email').value.trim(),
      phone: document.getElementById('enrol-phone').value.trim(),
      city: getSelectValue(citySelect, document.getElementById('enrol-city-other')),
      role: getSelectValue(roleSelect, document.getElementById('enrol-role-other')),
      certifications: getSelectValue(certSelect, document.getElementById('enrol-cert-other')),
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

  function showSubmitError(message) {
    submitError.textContent = message || 'Something went wrong. Please try again.';
    submitError.hidden = false;
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

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      if (data.success) {
        window.location.href = '/enrol/thank-you';
        return;
      }

      showSubmitError(data.error);
      setSubmitLoading(false);
    } catch (err) {
      setSubmitLoading(false);
      showSubmitError(err instanceof Error ? err.message : undefined);
    }
  }

  form.querySelectorAll('.enrol-form-ok').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = Number(btn.closest('.enrol-form-step')?.dataset.step);
      advanceFromTextStep(step);
    });
  });

  SELECT_FIELDS.forEach(({ selectId, otherWrapId, otherInputId }) => {
    const selectEl = document.getElementById(selectId);
    const otherWrapEl = document.getElementById(otherWrapId);
    const otherInputEl = document.getElementById(otherInputId);
    const step = Number(selectEl?.closest('.enrol-form-step')?.dataset.step);

    selectEl?.addEventListener('change', () => {
      toggleOtherInput(selectEl, otherWrapEl);
      clearError(step);
    });

    otherInputEl?.addEventListener('input', () => clearError(step));
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

  form.querySelectorAll('.enrol-form-select').forEach((select) => {
    select.addEventListener('change', () => {
      const step = Number(select.closest('.enrol-form-step')?.dataset.step);
      clearError(step);
    });
  });

  updateProgress(1);
})();
