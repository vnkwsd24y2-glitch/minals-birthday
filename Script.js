/* =====================================================
   MINAL'S BIRTHDAY — SCRIPT
   Loading sequence → intro reveal → surprise open →
   petals/sparkles ambience → scroll reveals →
   secret flower → ending heart formation.
   ===================================================== */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* ---------- Elements ---------- */
  const loader        = $('#loader');
  const loaderText     = $('#loaderText');
  const loaderPetalsEl  = document.querySelector('.loader-petals');
  const intro          = $('#intro');
  const introPetalsEl   = document.querySelector('.intro-petals');
  const openBtn         = $('#openSurpriseBtn');
  const mainContent     = $('#main-content');
  const petalsContainer = $('#petals-container');
  const sparklesContainer = $('#sparkles-container');
  const muteBtn         = $('#muteToggle');
  const iconSound       = $('#iconSound');
  const iconMute        = $('#iconMute');
  const bgMusic         = $('#bgMusic');
  const secretFlower    = $('#secretFlower');
  const secretOverlay   = $('#secretOverlay');
  const closeSecretBtn  = $('#closeSecret');
  const endingSection   = $('#endingSection');
  const heartContainer  = $('#heartContainer');

  let petalsActive = true;
  let petalIntervalId = null;
  let heartBuilt = false;

  /* =====================================================
     0. PHOTO SOURCES — exact uploaded filenames
     Order follows the camera-roll sequence IMG_0460–IMG_0471.
     IMG_0467 was the one filename not spelled out ("the
     remaining photo") — assumed here since it's the only gap
     in an otherwise unbroken run of 12. Wrong guess = only
     this one line needs fixing, nothing else depends on it.
     ===================================================== */
  const PHOTO_FILES = [
    'IMG_0460.jpeg',
    'IMG_0461.jpeg',
    'IMG_0462.jpeg',
    'IMG_0463.jpeg',
    'IMG_0464.jpeg',
    'IMG_0465.jpeg',
    'IMG_0466.jpeg',
    'IMG_0467.jpeg',
    'IMG_0468.jpeg',
    'IMG_0469.jpeg',
    'IMG_0470.jpeg',
    'IMG_0471.jpeg'
  ];

  function loadPhotos() {
    const imgs = document.querySelectorAll('.photo-section .photo-frame img');
    imgs.forEach((img, i) => {
      const file = PHOTO_FILES[i];
      if (!file) return;
      img.src = `photos/${file}`;
      // Graceful fallback: if a filename is off, hide the <img> instead
      // of showing a broken-image icon — the soft blush frame stays intact.
      img.addEventListener('error', () => {
        img.style.display = 'none';
        console.warn(`Photo not found: photos/${file} (section ${i + 1})`);
      }, { once: true });
    });
  }

  loadPhotos();

  /* =====================================================
     1. PETAL FACTORY (reused for loader / intro / ambient)
     ===================================================== */
  function spawnPetal(container, opts = {}) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = opts.size || rand(8, 16);
    const duration = opts.duration || rand(9, 16);
    const delay = opts.delay ?? rand(0, 4);
    const drift = rand(-80, 80);
    const spin = rand(240, 480);
    const left = opts.left ?? rand(0, 100);

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.15}px`;
    petal.style.left = `${left}%`;
    petal.style.setProperty('--drift', `${drift}px`);
    petal.style.setProperty('--spin', `${spin}deg`);
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.opacity = rand(0.5, 0.9).toFixed(2);

    container.appendChild(petal);

    petal.addEventListener('animationend', () => petal.remove());
    return petal;
  }

  function seedPetals(container, count) {
    for (let i = 0; i < count; i++) {
      spawnPetal(container, { delay: rand(0, 8) });
    }
  }

  // Gentle petals during loading + intro (lightweight, decorative)
  seedPetals(loaderPetalsEl, 8);
  seedPetals(introPetalsEl, 10);

  /* =====================================================
     2. LOADING SEQUENCE
     ===================================================== */
  const loadingMessages = [
    'Made just for someone special…',
    'Loading your birthday surprise…'
  ];

  function runLoader() {
    let step = 0;
    loaderText.textContent = loadingMessages[0];

    const swap = setInterval(() => {
      step++;
      if (step >= loadingMessages.length) {
        clearInterval(swap);
        return;
      }
      loaderText.style.opacity = '0';
      setTimeout(() => {
        loaderText.textContent = loadingMessages[step];
        loaderText.style.opacity = '1';
      }, 400);
    }, 1500);

    // Total loading time ~3.4s, then reveal intro
    setTimeout(() => {
      loader.classList.add('hide');
      intro.classList.add('show');
      // keep petals seeded periodically while intro is visible
      startAmbientLoop(introPetalsEl, 3200);
    }, 3400);
  }

  /* =====================================================
     3. AMBIENT LOOPS (intro + main experience)
     ===================================================== */
  function startAmbientLoop(container, intervalMs) {
    return setInterval(() => {
      if (document.hidden) return;
      spawnPetal(container);
    }, intervalMs);
  }

  function spawnSparkle() {
    if (!petalsActive) return;
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = `${rand(4, 96)}%`;
    s.style.top = `${rand(6, 92)}%`;
    s.style.animationDelay = `${rand(0, 1.6)}s`;
    sparklesContainer.appendChild(s);
    setTimeout(() => s.remove(), 3400);
  }

  function startMainAmbience() {
    petalIntervalId = setInterval(() => {
      if (!petalsActive) return;
      spawnPetal(petalsContainer);
    }, 750);

    setInterval(spawnSparkle, 1100);
  }

  /* =====================================================
     4. OPEN SURPRISE — music + reveal main content
     ===================================================== */
  openBtn.addEventListener('click', () => {
    // Attempt playback (user gesture satisfies iOS autoplay policy)
    bgMusic.volume = 0.55;
    const playPromise = bgMusic.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {/* silently ignore if blocked */});
    }
    muteBtn.classList.add('show');

    intro.classList.add('fade-out');

    setTimeout(() => {
      mainContent.classList.add('reveal-main');
      startMainAmbience();
      document.body.style.overflow = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

      // Smooth nudge scroll to begin the cinematic journey
      setTimeout(() => {
        window.scrollBy({ top: 60, behavior: 'smooth' });
      }, 500);
    }, 500);
  }, { once: true });

  /* ---------- Mute toggle ---------- */
  muteBtn.addEventListener('click', () => {
    bgMusic.muted = !bgMusic.muted;
    iconSound.style.display = bgMusic.muted ? 'none' : 'block';
    iconMute.style.display = bgMusic.muted ? 'block' : 'none';
  });

  /* =====================================================
     5. SCROLL REVEALS (photos, sentences, letter, ending)
     ===================================================== */
  const revealTargets = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else if (!entry.target.classList.contains('photo-section')) {
        // sentences can fade back out subtly for continued cinematic feel
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.32 });

  revealTargets.forEach((el) => revealObserver.observe(el));

  /* =====================================================
     6. SECRET FLOWER — appears once ending is reached
     ===================================================== */
  const endingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        secretFlower.classList.add('show');
        buildHeart();
        endingSection.classList.add('warm');
      }
    });
  }, { threshold: 0.4 });

  endingObserver.observe(endingSection);

  /* ---------- Ending heart formation ---------- */
  function heartPoint(t, scale, cx, cy) {
    // Parametric heart curve
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return {
      x: cx + x * scale,
      y: cy - y * scale
    };
  }

  function buildHeart() {
    if (heartBuilt) return;
    heartBuilt = true;

    const rect = heartContainer.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.42;
    const scale = Math.min(rect.width, rect.height) / 34;

    const pointCount = 46;
    for (let i = 0; i < pointCount; i++) {
      const t = (i / pointCount) * Math.PI * 2;
      const { x, y } = heartPoint(t, scale, cx, cy);

      const petal = document.createElement('div');
      petal.className = 'heart-petal';
      petal.style.left = `${x}px`;
      petal.style.top = `${y}px`;
      petal.style.animationDelay = `${rand(0, 1.4)}s`;

      heartContainer.appendChild(petal);

      // stagger the reveal for a "gathering" feel
      setTimeout(() => petal.classList.add('show'), 80 * i);
    }
  }

  /* =====================================================
     7. SECRET LETTER — open/close interaction
     ===================================================== */
  function openSecret() {
    document.body.classList.add('secret-open');
    secretOverlay.classList.add('open');
    secretOverlay.setAttribute('aria-hidden', 'false');
    petalsActive = false;

    // lower music volume gently
    fadeVolume(bgMusic.volume, 0.12, 700);
  }

  function closeSecret() {
    document.body.classList.remove('secret-open');
    secretOverlay.classList.remove('open');
    secretOverlay.setAttribute('aria-hidden', 'true');
    petalsActive = true;

    fadeVolume(bgMusic.volume, 0.55, 700);
  }

  function fadeVolume(from, to, duration) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      bgMusic.volume = from + (to - from) * progress;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  secretFlower.addEventListener('click', openSecret);
  closeSecretBtn.addEventListener('click', closeSecret);
  secretOverlay.addEventListener('click', (e) => {
    if (e.target === secretOverlay) closeSecret();
  });

  /* =====================================================
     INIT
     ===================================================== */
  document.body.style.overflow = 'hidden'; // locked until surprise opens
  runLoader();

})();
