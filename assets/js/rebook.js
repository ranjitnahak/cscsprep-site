(function () {
  const RAZORPAY_KEY = 'rzp_live_SoTN0mSsmFt2bz';
  const AMOUNT_PAISE = 49900;

  const form = document.getElementById('rebook-form');
  const paySection = document.getElementById('rebook-pay');
  const successSection = document.getElementById('rebook-success');
  const errorEl = document.getElementById('rebook-error');
  const submitBtn = document.getElementById('rebook-submit');
  const calLink = document.getElementById('rebook-cal-link');
  const emailNote = document.getElementById('rebook-email-note');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Opening checkout…' : 'Pay ₹499';
  }

  function readDetails() {
    return {
      name: document.getElementById('rebook-name').value.trim(),
      email: document.getElementById('rebook-email').value.trim(),
      phone: document.getElementById('rebook-phone').value.trim(),
    };
  }

  function validate(details) {
    if (!details.name) return 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) return 'Enter a valid email address.';
    const digits = details.phone.replace(/\D/g, '');
    if (digits.length < 8) return 'Enter a valid phone number.';
    return '';
  }

  function showSuccess(emailWarning) {
    calLink.href = CSCS_CONFIG.calLink;
    paySection.hidden = true;
    successSection.hidden = false;
    if (emailWarning) {
      emailNote.textContent = emailWarning;
      emailNote.hidden = false;
    }
  }

  async function notifyPaid(details, razorpayPaymentId) {
    try {
      const res = await fetch(CSCS_CONFIG.rebookEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          phone: details.phone,
          razorpay_payment_id: razorpayPaymentId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return data.error || 'We could not email the link. Use the button above to book.';
      }
      return data.email_warning || '';
    } catch {
      return 'We could not email the link. Use the button above to book.';
    }
  }

  function openCheckout(details) {
    if (typeof Razorpay !== 'function') {
      showError('Checkout could not load. Refresh the page and try again.');
      setLoading(false);
      return;
    }

    const checkout = new Razorpay({
      key: RAZORPAY_KEY,
      amount: AMOUNT_PAISE,
      currency: 'INR',
      name: 'CSCS Prep',
      description: 'CSCS clarity call rebook',
      prefill: {
        name: details.name,
        email: details.email,
        contact: details.phone,
      },
      theme: { color: '#F4511E' },
      handler: function (response) {
        showSuccess('');
        notifyPaid(details, response.razorpay_payment_id || '').then(function (warning) {
          if (!warning) return;
          emailNote.textContent = warning;
          emailNote.hidden = false;
        });
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    });

    checkout.open();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');
    const details = readDetails();
    const message = validate(details);
    if (message) {
      showError(message);
      return;
    }
    setLoading(true);
    openCheckout(details);
  });
})();
