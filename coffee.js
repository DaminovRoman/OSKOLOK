/* ═══════════════════════════════════════════════════════════════════
   OSKOLOK — Interaction Layer
   Vanilla JS, без библиотек. Каждый блок ниже соответствует одной
   анимации/поведению из требований брифа с описанием назначения.
═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────────────
     1) SCROLL PROGRESS
     Trigger: scroll | Duration: continuous | Easing: linear (real-time)
     Purpose: даёт ощущение "где я в истории бренда" — важно для
     длинного одностраничника, чтобы не потерять пользователя.
  ───────────────────────────────────────────────────────────────── */
  const scrollFill = document.getElementById('scrollFill');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollFill) scrollFill.style.width = pct + '%';
  }

  /* ─────────────────────────────────────────────────────────────────
     2) NAV — Luxury Blur Transition on scroll
     Trigger: scroll > 40px | Duration: 0.6s | Easing: ease-luxury
     Purpose: навигация "материализуется" из прозрачного стекла в
     плотное, сигнализируя переход от героя к контенту.
  ───────────────────────────────────────────────────────────────── */
  const nav = document.getElementById('siteNav');
  function updateNavState() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavState();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  updateScrollProgress();
  updateNavState();

  /* ─────────────────────────────────────────────────────────────────
     3) MOBILE MENU
     Trigger: click burger | Duration: 0.6s | Easing: ease-glass
  ───────────────────────────────────────────────────────────────── */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     4) ORGANIC REVEAL (scroll-triggered)
     Trigger: IntersectionObserver, 15% visible | Duration: 0.9s
     Delay: staggered 60ms per sibling | Easing: ease-luxury
     Purpose: контент "проявляется" из размытия, как объект,
     обретающий резкость — усиливает ощущение "арт-объекта".
  ───────────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const groups = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = groups.get(entry.target.parentElement) || [entry.target];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.max(0, idx) * 70;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ─────────────────────────────────────────────────────────────────
     5) MAGNETIC BUTTONS
     Trigger: mousemove within bounds | Duration: 0.3s follow / 0.5s release
     Easing: ease-magnetic (overshoot) | Purpose: кнопки реагируют на
     курсор как жидкий металл — тактильное ощущение премиальности.
  ───────────────────────────────────────────────────────────────── */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.setProperty('--mx', `${x * strength}px`);
        btn.style.setProperty('--my', `${y * strength}px`);
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     6) MENU TABS
     Trigger: click | Duration: 0.5s panel fade | Easing: ease-glass
  ───────────────────────────────────────────────────────────────── */
  const menuTabs = document.querySelectorAll('[data-menu-tab]');
  const menuPanels = document.querySelectorAll('[data-menu-panel]');
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.menuTab;

      menuTabs.forEach(t => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });

      menuPanels.forEach(panel => {
        const match = panel.dataset.menuPanel === target;
        panel.classList.toggle('is-active', match);
        panel.hidden = !match;
      });
    });
  });

  /* ─────────────────────────────────────────────────────────────────
     7) COUNT-UP FACTS
     Trigger: IntersectionObserver, once | Duration: 1.6s | Easing: easeOutExpo
     Purpose: превращает статичные цифры в "живое" доказательство —
     пользователь видит, как факт "вычисляется" у него на глазах.
  ───────────────────────────────────────────────────────────────── */
  const countEls = document.querySelectorAll('[data-count]');
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  if (prefersReducedMotion) {
    countEls.forEach(el => { el.textContent = el.dataset.count; });
  } else if ('IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach(el => countIO.observe(el));
  } else {
    countEls.forEach(el => { el.textContent = el.dataset.count; });
  }

  /* ─────────────────────────────────────────────────────────────────
     8) BOOKING MODAL
     Trigger: click CTA | Duration: 0.6s | Easing: ease-glass
     Purpose: последний шаг воронки — бронирование без ухода со страницы.
  ───────────────────────────────────────────────────────────────── */
  const bookingModal = document.getElementById('bookingModal');
  const openTriggers = [document.getElementById('bookTableBtn'), ...document.querySelectorAll('.nav__cta, .mobile-menu__cta')];
  const closeTriggers = document.querySelectorAll('[data-close-modal]');
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');

  function openModal(e) {
    if (e) e.preventDefault();
    bookingModal.classList.add('is-open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = bookingModal.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 350);
  }
  function closeModal() {
    bookingModal.classList.remove('is-open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openTriggers.forEach(t => t && t.addEventListener('click', openModal));
  closeTriggers.forEach(t => t.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('is-open')) closeModal();
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
      setTimeout(() => {
        closeModal();
        setTimeout(() => {
          bookingForm.hidden = false;
          bookingSuccess.hidden = true;
          bookingForm.reset();
        }, 400);
      }, 2200);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     9) AMBIENT GLOW — parallax подстройка под курсор
     Trigger: mousemove (throttled via rAF) | Duration: continuous
     Purpose: лёгкий параллакс световых пятен создаёт ощущение
     глубины помещения, а не плоской картинки.
  ───────────────────────────────────────────────────────────────── */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    const glows = document.querySelectorAll('.ambient-glow');
    let mouseX = 0.5, mouseY = 0.5, rafPending = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          glows.forEach((glow, i) => {
            const depth = (i + 1) * 6;
            glow.style.transform = `translate(${(mouseX - 0.5) * depth}px, ${(mouseY - 0.5) * depth}px)`;
          });
          rafPending = false;
        });
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────
     10) SMOOTH ANCHOR SCROLL (fallback offset for fixed nav)
  ───────────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 84;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

})();
