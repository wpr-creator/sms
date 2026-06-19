(() => {
  const wipe = document.getElementById('wipe') || document.getElementById('screenWipe');

  // ── safeJSON ──────────────────────────────────────────────────────────────
  // Uses ?? (nullish coalescing) so a stored value of 0, false, or []
  // is returned correctly instead of being replaced by the fallback.
  function safeJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch(e) {
      return fallback;
    }
  }

  // ── Sound ─────────────────────────────────────────────────────────────────
  function playTone(freq = 660, dur = .08, type = 'triangle') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + .02);
    } catch(e) {}
  }

  // ── Read all progress keys ────────────────────────────────────────────────
  const campSave       = safeJSON('falconCampSave', {});
  const campBadges     = Array.isArray(campSave.badges) ? campSave.badges : [];

  // Flight School stores badges and progress under its own keys
  const flightBadges   = safeJSON('flight_school_badges_v19', []);
  const flightProgress = safeJSON('flight_school_progress_v19', { complete: [] });

  // Legacy keys kept so prior testing progress still shows
  const oldFlightBadges   = safeJSON('fs_badges', []);
  const oldFlightProgress = safeJSON('fs_progress_v9', { complete: [] });

  const allBadges = [...new Set([
    ...campBadges,
    ...Array.isArray(flightBadges)    ? flightBadges    : [],
    ...Array.isArray(oldFlightBadges) ? oldFlightBadges : []
  ])];

  const flightCompleteCount = Math.max(
    Array.isArray(flightProgress.complete)    ? flightProgress.complete.length    : 0,
    Array.isArray(oldFlightProgress.complete) ? oldFlightProgress.complete.length : 0
  );

  // ── Path completion flags ─────────────────────────────────────────────────
  const flightDone    = Boolean(campSave.flightSchoolComplete) || flightCompleteCount >= 16;
  const fieldDone     = Boolean(campSave.fieldLabComplete);
  const expeditionDone = Boolean(campSave.expeditionComplete);
  const stormDone     = Boolean(campSave.stormWatchComplete);
  const palaceDone    = Boolean(campSave.prinslowPalaceComplete);

  const pathFlags  = [flightDone, fieldDone, expeditionDone, stormDone];
  const paths      = pathFlags.filter(Boolean).length;
  const totalPaths = 4;
  const progress   = Math.round((paths / totalPaths) * 100);

  const rank =
    paths === 4 ? 'CAMP CHAMPION' :
    paths === 3 ? 'TRAIL BLAZER'  :
    paths === 2 ? 'PATHFINDER'    :
    paths === 1 ? 'SKY SCOUT'     : 'SKY SCOUT';

  // ── Update HUD chips ──────────────────────────────────────────────────────
  const badgeCountEl = document.getElementById('badgeCount');
  const pathCountEl  = document.getElementById('pathCount');
  const rankNameEl   = document.getElementById('rankName');
  const goalFill     = document.getElementById('goalFill');
  const goalText     = document.getElementById('goalText');
  const guideSpeech  = document.getElementById('guideSpeech');

  if (badgeCountEl) badgeCountEl.textContent = String(allBadges.length || 0);
  if (pathCountEl)  pathCountEl.textContent  = String(paths);
  if (rankNameEl)   rankNameEl.textContent   = rank;
  if (goalFill)     goalFill.style.width     = progress + '%';
  if (goalText)     goalText.textContent     = progress + '%';

  // ── Guide speech bubble ───────────────────────────────────────────────────
  if (guideSpeech) {
    const messages =
      paths === 4 ? [
        'Camp complete! You earned every path.',
        'You are a Camp Champion!',
        'Ready to replay your favorite path?'
      ] : paths === 3 ? [
        'One path left — you are so close!',
        'Three paths complete. Keep going!',
        'Choose the final challenge.'
      ] : paths === 2 ? [
        'Two paths complete. Keep going!',
        'Choose another path to continue.',
        'Half the camp is complete!'
      ] : paths === 1 ? [
        'Nice start! Pick your next path.',
        'One path complete. Keep moving!',
        'Your next mission is waiting.'
      ] : [
        'Choose a path to start your adventure!',
        'Flight School is ready for takeoff!',
        'Field Lab needs a scientist!',
        'Expedition Corps needs an explorer!',
        'Storm Watch needs a weather observer!'
      ];
    guideSpeech.textContent = messages[Math.floor(Math.random() * messages.length)];
  }

  // ── Path card complete states ─────────────────────────────────────────────
  // Adds a .path-done class to each completed path card so CSS can show a
  // visual badge. Map: card class → done flag.
  const pathMap = [
    { cls: '.flight',     done: flightDone     },
    { cls: '.lab',        done: fieldDone      },
    { cls: '.expedition', done: expeditionDone },
    { cls: '.storm',      done: stormDone      }
  ];
  pathMap.forEach(({ cls, done }) => {
    if (done) {
      const card = document.querySelector(cls + '.path-card');
      if (card) card.classList.add('path-done');
    }
  });

  // ── Palace completion badge ───────────────────────────────────────────────
  // If Prinslow Palace is complete, add .palace-done to the palace card so
  // CSS shows a "KEEPER" badge overlay.
  if (palaceDone) {
    const palaceCard = document.querySelector('.destination-card.palace');
    if (palaceCard) palaceCard.classList.add('palace-done');
  }

  // ── Navigation wipe ───────────────────────────────────────────────────────
  // Only binds to [data-go] elements — avoids the double-listener bug that
  // occurred when the old selector matched both [data-go] AND a[href] on the
  // same element, causing two handlers to fire on every click.
  document.querySelectorAll('[data-go]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      event.preventDefault();
      playTone(620, .08);
      setTimeout(() => playTone(880, .1), 80);
      wipe?.classList.add('on');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
})();
