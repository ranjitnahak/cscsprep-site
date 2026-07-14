(function () {
  let initialized = false;

  function initCoachSlideshow() {
    if (initialized) return;

    const slidesContainer = document.querySelector('.meet-coach-slideshow-slides');
    const captionEl = document.querySelector('.meet-coach-slideshow-caption');
    const dotsContainer = document.querySelector('.meet-coach-slideshow-dots');
    if (!slidesContainer || !captionEl || !dotsContainer) return;

    initialized = true;

    const slides = [
      { src: '/assets/images/coach/coach-1.jpg', caption: 'S&C Coach, Pretoria Capitals — SA T20 League' },
      { src: '/assets/images/coach/coach-2.jpg', caption: 'Haryana Steelers, Pro Kabaddi League Season 10', objectPosition: 'center 12%' },
      { src: '/assets/images/coach/coach-3.jpg', caption: 'Soorma Hockey Club — Hockey India League', objectPosition: 'center top' },
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
        if (slide.objectPosition) {
          img.style.objectPosition = slide.objectPosition;
        }
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

  document.addEventListener('partial:loaded', (e) => {
    if (e.detail?.name === 'coach-section') {
      initCoachSlideshow();
    }
  });
})();
