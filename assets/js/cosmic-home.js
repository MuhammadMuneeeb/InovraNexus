(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  const slides = Array.from(document.querySelectorAll('[data-reel-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-reel-dot]'));
  const reelBar = document.getElementById('reel-progress-bar');
  const campaignReel = document.getElementById('campaign-reel');

  if (slides.length > 0 && dots.length === slides.length) {
    let active = 0;
    let timer = null;
    let isPaused = false;
    const cycleMs = 4200;

    const setActive = index => {
      active = index;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

      if (reelBar) {
        reelBar.style.transition = 'none';
        reelBar.style.width = '0%';
        requestAnimationFrame(() => {
          reelBar.style.transition = prefersReducedMotion ? 'none' : `width ${cycleMs}ms linear`;
          reelBar.style.width = '100%';
        });
      }
    };

    const queueNext = () => {
      clearTimeout(timer);
      if (prefersReducedMotion || isPaused) {
        return;
      }
      timer = window.setTimeout(() => {
        setActive((active + 1) % slides.length);
        queueNext();
      }, cycleMs);
    };

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.getAttribute('data-reel-dot'));
        if (Number.isInteger(idx)) {
          setActive(idx);
          queueNext();
        }
      });
    });

    if (campaignReel) {
      campaignReel.addEventListener('mouseenter', () => {
        isPaused = true;
        clearTimeout(timer);
        if (reelBar) {
          const computed = window.getComputedStyle(reelBar).width;
          reelBar.style.transition = 'none';
          reelBar.style.width = computed;
        }
      });

      campaignReel.addEventListener('mouseleave', () => {
        isPaused = false;
        if (reelBar) {
          reelBar.style.transition = prefersReducedMotion ? 'none' : `width ${cycleMs}ms linear`;
          reelBar.style.width = '100%';
        }
        queueNext();
      });
    }

    setActive(0);
    queueNext();
  }

  const counters = document.querySelectorAll('[data-kpi-target]');
  if (counters.length > 0) {
    const animate = el => {
      const target = Number(el.getAttribute('data-kpi-target')) || 0;
      const suffix = el.getAttribute('data-kpi-suffix') || '';
      const duration = 1100;
      const start = performance.now();

      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    counters.forEach(counter => observer.observe(counter));
  }

  const meters = document.querySelectorAll('[data-meter]');
  if (meters.length > 0) {
    const meterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = Number(entry.target.getAttribute('data-meter')) || 0;
          entry.target.style.width = `${Math.max(0, Math.min(100, target))}%`;
          meterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    meters.forEach(meter => meterObserver.observe(meter));
  }
})();
