/* ============================================================
   CLÍNICA ELANCÉ — script.js
   Counter Animation + Carousel + Scroll Animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. ANIMATED COUNTER
     ---------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const step = 30;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, step);
  }

  const counterEls = document.querySelectorAll('[data-counter]');
  let counterStarted = false;

  function startCounters(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterStarted) {
        counterStarted = true;
        counterEls.forEach(animateCounter);
      }
    });
  }

  if (counterEls.length > 0) {
    const counterObserver = new IntersectionObserver(startCounters, { threshold: 0.3 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ----------------------------------------------------------
     2. SCROLL-TRIGGERED APPEAR ANIMATIONS
     ---------------------------------------------------------- */
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-hidden').forEach(el => animObserver.observe(el));

  /* ----------------------------------------------------------
     3. INFINITE CAROUSEL — DUPLICATE SLIDES FOR SEAMLESS LOOP
     ---------------------------------------------------------- */
  function setupInfiniteCarousel(trackSelector) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    // Clone all slides and append for seamless loop
    const originals = Array.from(track.children);
    originals.forEach(slide => {
      const clone = slide.cloneNode(true);
      track.appendChild(clone);
    });
  }

  setupInfiniteCarousel('.results-carousel__track');
  setupInfiniteCarousel('.services-carousel__track');

  /* ----------------------------------------------------------
     4. PAUSE CAROUSEL ON HOVER (already via CSS, belt-and-suspenders)
     ---------------------------------------------------------- */
  document.querySelectorAll('.results-carousel, .services-carousel').forEach(wrap => {
    const track = wrap.querySelector('.results-carousel__track, .services-carousel__track');
    if (!track) return;
    wrap.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    wrap.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  });

  /* ----------------------------------------------------------
     5. DEPOIMENTOS SLIDER — MANUAL ARROW NAVIGATION
     ---------------------------------------------------------- */
  const spTrack   = document.getElementById('sp-track');
  const spPrev    = document.getElementById('sp-prev');
  const spNext    = document.getElementById('sp-next');
  const spCounter = document.getElementById('sp-counter');

  if (spTrack && spPrev && spNext) {
    const slides = Array.from(spTrack.children);
    const totalSlides = slides.length;
    let currentIndex = 0;

    function getSlidesPerView() {
      return window.innerWidth <= 768 ? 1 : 3;
    }

    function getMaxIndex() {
      return Math.max(0, totalSlides - getSlidesPerView());
    }

    function updateSlider() {
      const perView = getSlidesPerView();
      const gap = 20;
      const slideWidth = spTrack.parentElement.offsetWidth / perView;
      const adjustedSlideWidth = slideWidth - (gap * (perView - 1)) / perView;

      // Set each slide width dynamically
      slides.forEach(slide => {
        slide.style.width = adjustedSlideWidth + 'px';
      });

      const offset = currentIndex * (adjustedSlideWidth + gap);
      spTrack.style.transform = `translateX(-${offset}px)`;

      // Update buttons
      spPrev.disabled = currentIndex <= 0;
      spNext.disabled = currentIndex >= getMaxIndex();

      // Update counter
      if (spCounter) {
        const endIdx = Math.min(currentIndex + perView, totalSlides);
        spCounter.textContent = `${currentIndex + 1}–${endIdx} de ${totalSlides}`;
      }
    }

    spPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });

    spNext.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateSlider();
      }
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      updateSlider();
    });

    updateSlider();
  }

  /* ----------------------------------------------------------
     6. FAQ ACCORDION
     ---------------------------------------------------------- */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;
      const parentList = btn.closest('.faq__list');

      // Close all siblings within the same list
      if (parentList) {
        parentList.querySelectorAll('.faq__question').forEach(sibling => {
          if (sibling !== btn) {
            sibling.setAttribute('aria-expanded', 'false');
            const sibAnswer = sibling.nextElementSibling;
            if (sibAnswer) sibAnswer.classList.remove('faq__answer--open');
          }
        });
      }

      // Toggle current
      const newState = !isOpen;
      btn.setAttribute('aria-expanded', String(newState));
      if (answer) answer.classList.toggle('faq__answer--open', newState);
    });
  });

});
