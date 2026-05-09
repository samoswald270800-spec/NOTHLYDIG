(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── HEADER SCROLL STATE ── */
  const header = $('#header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE MENU ── */
  const burger = $('#hamburger');
  const navLinks = $('#nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link', navLinks).forEach(l => {
      l.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── SMOOTH SCROLL (offset for sticky nav) ── */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ── ACTIVE NAV LINK ── */
  const sections = $$('section[id], div[id]');
  const links = $$('.nav-link');
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const match = $$(`.nav-link[href="#${e.target.id}"]`)[0];
        if (match) match.classList.add('active');
      });
    }, { rootMargin: `-${(header ? header.offsetHeight : 68) + 20}px 0px -60% 0px`, threshold: 0 });
    sections.forEach(s => io.observe(s));
  }

  /* ── SCROLL REVEAL ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (!reduced) {
          e.target.classList.add('visible');
        }
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

    $$('.reveal').forEach((el, i) => {
      if (reduced) { el.classList.add('visible'); return; }
      const siblings = $$(`.reveal`, el.parentElement);
      const idx = siblings.indexOf(el);
      el.style.transitionDelay = `${Math.min(idx * 65, 380)}ms`;
      io.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ── COUNTER ANIMATION ── */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animCount = el => {
    const target = +el.dataset.target;
    const dur = 1800;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(easeOutCubic(p) * target);
      el.textContent = v.toLocaleString('en-CA');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('en-CA');
    };
    requestAnimationFrame(tick);
  };

  const counterEls = $$('[data-target]');
  if (counterEls.length && 'IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animCount(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.7 });
    counterEls.forEach(el => io.observe(el));
  } else {
    counterEls.forEach(el => { el.textContent = (+el.dataset.target).toLocaleString('en-CA'); });
  }

  /* ── FORM HANDLER ── */
  const handleForm = (formId, btnId, btnTxtId, successId) => {
    const form    = $(`#${formId}`);
    const btn     = $(`#${btnId}`);
    const btnTxt  = $(`#${btnTxtId}`);
    const success = $(`#${successId}`);
    if (!form || !btn) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const orig = btnTxt ? btnTxt.textContent : btn.textContent;
      if (btnTxt) btnTxt.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        if (btnTxt) btnTxt.textContent = orig;
        btn.disabled = false;
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => { success.style.display = 'none'; }, 7000);
        }
      }, 1100);
    });
  };

  handleForm('hero-form', 'hero-submit', 'hero-btn-txt', 'hero-success');
  handleForm('main-contact-form', 'main-submit', 'main-btn-txt', 'main-success');

  /* ── FAQ SMOOTH EXPAND ── */
  $$('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        $$('.faq-item').forEach(other => {
          if (other !== item && other.open) other.removeAttribute('open');
        });
      }
    });
  });

  /* ── FOOTER YEAR ── */
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── PAUSE MARQUEE ON HOVER ── */
  const marquee = $('#marquee');
  if (marquee && !reduced) {
    marquee.parentElement.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.parentElement.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }
})();
