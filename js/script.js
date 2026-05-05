/* ============================================================
   CLANS MACHINA - JS: Canvas, Counters, Calculator, Chatbot
   ============================================================ */

(function () {
  'use strict';

  /* ---- NAVBAR SCROLL ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ---- HAMBURGER MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- CANVAS PARTICLE ANIMATION ---- */
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Background gradient
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    grad.addColorStop(0, 'rgba(78,168,222,0.06)');
    grad.addColorStop(1, 'rgba(17,21,24,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(62,207,142,${0.14 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.7})`;
      ctx.fill();
    });
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    animFrame = requestAnimationFrame(animate);
  }

  resizeCanvas();
  createParticles();
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animFrame);
      resizeCanvas();
      createParticles();
      animate();
    }, 200);
  });

  /* ---- INTERSECTION OBSERVER: SCROLL ANIMATIONS + COUNTERS ---- */
  const animElements = document.querySelectorAll('[data-animate]');
  const countersStarted = new Set();

  function animateCounter(el) {
    if (countersStarted.has(el)) return;
    countersStarted.add(el);
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('en-IN');
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Start counters inside this element
        entry.target.querySelectorAll('.trust-num[data-target], .impact-num[data-target]').forEach(animateCounter);
        // If the element itself is a counter
        if (entry.target.classList.contains('trust-num') || entry.target.classList.contains('impact-num')) {
          animateCounter(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animElements.forEach(el => observer.observe(el));

  // Also observe counters outside data-animate
  document.querySelectorAll('.trust-num[data-target], .impact-num[data-target]').forEach(el => {
    const counterObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(el);
        counterObs.unobserve(el);
      }
    }, { threshold: 0.5 });
    counterObs.observe(el);
  });

  /* ---- RANGE SLIDER ---- */
  const roofSize = document.getElementById('roofSize');
  const roofSizeLabel = document.getElementById('roofSizeLabel');
  if (roofSize) {
    roofSize.addEventListener('input', () => {
      roofSizeLabel.textContent = roofSize.value + ' sq ft';
    });
  }

  /* ---- SOLAR CALCULATOR ---- */
  const calcForm = document.getElementById('calcForm');
  if (calcForm) {
    calcForm.addEventListener('submit', e => {
      e.preventDefault();
      const bill = parseFloat(document.getElementById('monthlyBill').value) || 0;
      const locationMultiplier = parseFloat(document.getElementById('location').value) || 1.4;
      const roof = parseFloat(document.getElementById('roofSize').value) || 500;

      // Calculation logic
      const annualSavings = Math.round(bill * 12 * 0.82);
      const systemSize = parseFloat(((roof / 100) * locationMultiplier).toFixed(1));
      const systemCost = systemSize * 55000; // approx Rs.55k per kW installed
      const roi = systemCost > 0 && annualSavings > 0 ? parseFloat((systemCost / annualSavings).toFixed(1)) : 0;
      const co2 = parseFloat((systemSize * 1.5).toFixed(1));

      // Update result elements
      document.getElementById('annualSavings').textContent =
        '\u20B9' + annualSavings.toLocaleString('en-IN');
      document.getElementById('roiYears').textContent = roi + ' Yrs';
      document.getElementById('co2Saved').textContent = co2 + ' T';
      document.getElementById('systemSize').textContent = systemSize + ' kW';

      // Show results
      document.getElementById('calcPlaceholder').style.display = 'none';
      document.getElementById('resultCards').style.display = 'grid';
    });
  }

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      setTimeout(() => {
        document.getElementById('formSuccess').style.display = 'flex';
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Book Free Consultation';
      }, 1200);
    });
  }

  /* ---- CHATBOT ---- */
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  function addMsg(text, isBot) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (isBot ? 'bot-msg' : 'user-msg');
    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getBotResponse(msg) {
    const m = msg.toLowerCase();
    if (m.includes('saving') || m.includes('bill') || m.includes('calculat')) {
      return 'With solar, most customers save 80-90% on electricity bills. Use our calculator above to get your exact savings!';
    }
    if (m.includes('quote') || m.includes('price') || m.includes('cost')) {
      return 'A typical home system costs Rs.2.5L to Rs.4L installed. After PM Surya Ghar subsidy, your net cost can be much lower. Want a free site survey?';
    }
    if (m.includes('subsid') || m.includes('scheme') || m.includes('government')) {
      return 'Under PM Surya Ghar Muft Bijli scheme 2025, you can get up to Rs.78,000 subsidy on residential rooftop solar. We handle all the paperwork!';
    }
    if (m.includes('install') || m.includes('how long') || m.includes('time')) {
      return 'Our installations are typically completed in 1-2 days. From booking to going live, the entire process takes 15-25 days including approvals.';
    }
    if (m.includes('warrant') || m.includes('guarantee')) {
      return 'We offer a 25-year panel performance warranty, 10-year inverter warranty, and our ClansZero savings guarantee - India\'s first!';
    }
    if (m.includes('hi') || m.includes('hello') || m.includes('hey')) {
      return 'Hello! I am SolarBot. I can help with solar savings, pricing, subsidies and more. What would you like to know?';
    }
    return 'Great question! Our solar experts can give you a detailed answer. Book a free consultation and we will call you within 2 hours.';
  }

  function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMsg(text, false);
    chatInput.value = '';
    setTimeout(() => addMsg(getBotResponse(text), true), 700);
  }

  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
      const isOpen = chatbotPanel.style.display !== 'none';
      chatbotPanel.style.display = isOpen ? 'none' : 'block';
    });
  }
  if (chatClose) {
    chatClose.addEventListener('click', () => {
      chatbotPanel.style.display = 'none';
    });
  }
  if (chatSend) {
    chatSend.addEventListener('click', sendChat);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendChat();
    });
  }

  // Quick replies
  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const reply = btn.dataset.reply;
      addMsg(reply, false);
      setTimeout(() => addMsg(getBotResponse(reply), true), 700);
      chatbotPanel.style.display = 'block';
    });
  });

  /* ---- THEME PICKER ---- */
  const themePickerBtn = document.getElementById('themePickerBtn');
  const themePanel     = document.getElementById('themePanel');
  const themeOverlay   = document.getElementById('themeOverlay');
  const themePanelClose = document.getElementById('themePanelClose');
  const THEME_KEY = 'cm_theme';

  function applyTheme(name) {
    const html = document.documentElement;
    if (name === 'industrial' || !name) {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', name);
    }
    // Mark active swatch
    document.querySelectorAll('.theme-swatch').forEach(s => {
      const isActive = (s.dataset.theme === name) || (!name && s.dataset.theme === 'industrial');
      s.classList.toggle('active', isActive);
    });
    try { localStorage.setItem(THEME_KEY, name); } catch(e) {}
  }

  function openThemePanel() {
    themePanel.classList.add('open');
    themeOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeThemePanel() {
    themePanel.classList.remove('open');
    themeOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (themePickerBtn) themePickerBtn.addEventListener('click', openThemePanel);
  if (themePanelClose) themePanelClose.addEventListener('click', closeThemePanel);
  if (themeOverlay) themeOverlay.addEventListener('click', closeThemePanel);

  document.querySelectorAll('.theme-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      setTimeout(closeThemePanel, 220);
    });
  });

  // Restore saved theme on load
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch(e) {}

})();
