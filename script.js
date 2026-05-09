(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* NAV SCROLL STATE */
  const nav = $('#nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* MOBILE MENU */
  const burger   = $('#hamburger');
  const navLinks = $('#nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
    });
    $$('.nav-link').forEach(l => l.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
    }));
  }

  /* SMOOTH SCROLL WITH OFFSET */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ACTIVE NAV LINK */
  const sections = $$('section[id]');
  const links    = $$('.nav-link');
  if (sections.length && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      });
    }, { threshold: 0.4, rootMargin: '-60px 0px -40% 0px' }).observe.bind(
      new IntersectionObserver(() => {})
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      });
    }, { threshold: 0.35 });
    sections.forEach(s => io.observe(s));
  }

  /* SCROLL REVEAL */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${i * 50}ms`;
        e.target.classList.add('visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* COUNTER ANIMATION */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const animate = (el) => {
    const target   = +el.dataset.target;
    const duration = 1600;
    const t0       = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animate(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.7 });
    $$('[data-target]').forEach(el => {
      if (!reduced) io.observe(el);
      else el.textContent = (+el.dataset.target).toLocaleString();
    });
  }

  /* CONTACT FORM */
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn   = $('#submit-btn');
      const label = $('#btn-label');
      label.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        label.textContent = 'Submit request';
        btn.disabled = false;
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 6000);
      }, 1100);
    });
  }

  /* FOOTER YEAR */
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
