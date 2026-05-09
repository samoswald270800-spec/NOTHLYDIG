/* =====================================================
   NORTHLY DIGITAL — micro-interactions
   Subtle. Smooth. Performance-first.
   ===================================================== */

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAVBAR SCROLL STATE ---------- */
  const navbar = $('#navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  /* ---------- REVEAL ON SCROLL (with stagger) ---------- */
  const revealEls = $$('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    // Group reveal items by their parent for natural staggering
    const seenParents = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement || document.body;
      const idx = seenParents.get(parent) ?? 0;
      el.style.transitionDelay = `${Math.min(idx * 70, 420)}ms`;
      seenParents.set(parent, idx + 1);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- ANIMATED COUNTER ---------- */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animateCounter = (el) => {
    const target   = +el.dataset.target;
    const duration = 1800;
    const isInt    = Number.isInteger(target);
    const start    = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const v = easeOutCubic(p) * target;
      el.textContent = isInt
        ? Math.floor(v).toLocaleString()
        : v.toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isInt ? target.toLocaleString() : target.toFixed(1);
    };
    requestAnimationFrame(tick);
  };

  const counterEls = $$('.stat-number[data-target]');
  if (counterEls.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.55 });
    counterEls.forEach(el => io.observe(el));
  } else {
    counterEls.forEach(el => { el.textContent = (+el.dataset.target).toLocaleString(); });
  }

  /* ---------- MAGNETIC BUTTONS (subtle pull) ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnetic]').forEach(el => {
      const strength = 14;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength * 0.6}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- SERVICE CARD CURSOR-AWARE GLOW ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('.service-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
      });
    });
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  const sections = $$('section[id]');
  const navLinkEls = $$('.nav-link');
  if (sections.length && navLinkEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinkEls.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- CONTACT FORM ---------- */
  const form = $('#contact-form');
  const successMsg = $('#form-success');
  if (form && successMsg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = $('#form-submit');
      const btnText   = $('#btn-text');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const original = btnText.textContent;
      btnText.textContent = 'Sending…';
      submitBtn.disabled = true;
      submitBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        form.reset();
        btnText.textContent = original;
        submitBtn.disabled = false;
        submitBtn.style.pointerEvents = '';
        successMsg.style.display = 'flex';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      }, 1200);
    });
  }

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- SMOOTH ANCHOR SCROLL OFFSET ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- PARALLAX AURORAS (gentle) ---------- */
  if (!reduce) {
    const auroras = $$('.aurora');
    let raf = null;
    let mouseX = 0.5, mouseY = 0.5;
    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        auroras.forEach((a, i) => {
          const factor = (i + 1) * 8;
          a.style.translate = `${(mouseX - 0.5) * factor}px ${(mouseY - 0.5) * factor}px`;
        });
        raf = null;
      });
    }, { passive: true });
  }
})();
