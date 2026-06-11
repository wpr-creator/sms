(() => {
  const wipe = document.getElementById('wipe') || document.getElementById('screenWipe');

  function safeJSON(key, fallback){
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value || fallback;
    } catch(e) {
      return fallback;
    }
  }

  function playTone(freq = 660, dur = .08, type = 'triangle'){
    try{
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

  const campSave = safeJSON('falconCampSave', {});
  const campBadges = Array.isArray(campSave.badges) ? campSave.badges : [];

  // Current Flight School keys used by flight-school.js
  const flightBadges = safeJSON('flight_school_badges_v19', []);
  const flightProgress = safeJSON('flight_school_progress_v19', { complete: [] });

  // Older keys kept as fallback so prior testing progress still shows if present.
  const oldFlightBadges = safeJSON('fs_badges', []);
  const oldFlightProgress = safeJSON('fs_progress_v9', { complete: [] });

  const allBadges = [...new Set([
    ...campBadges,
    ...flightBadges,
    ...oldFlightBadges
  ])];

  const flightCompleteCount = Math.max(
    Array.isArray(flightProgress.complete) ? flightProgress.complete.length : 0,
    Array.isArray(oldFlightProgress.complete) ? oldFlightProgress.complete.length : 0
  );

  const flightDone = Boolean(campSave.flightSchoolComplete) || flightCompleteCount >= 16;
  const fieldDone = Boolean(campSave.fieldLabComplete);
  const expeditionDone = Boolean(campSave.expeditionComplete);
  const stormDone = Boolean(campSave.stormWatchComplete);
  const paths = [flightDone, fieldDone, expeditionDone, stormDone].filter(Boolean).length;
  const totalPaths = 4;
  const progress = Math.round((paths / totalPaths) * 100);
  const rank = paths === 4 ? 'CAMP CHAMPION' : paths === 3 ? 'TRAIL BLAZER' : paths === 2 ? 'PATHFINDER' : paths === 1 ? 'SKY SCOUT' : 'SKY SCOUT';

  const badgeCount = document.getElementById('badgeCount') || document.getElementById('badgePill');
  const pathCount = document.getElementById('pathCount') || document.getElementById('pathPill');
  const rankName = document.getElementById('rankName') || document.getElementById('rankPill');
  const goalFill = document.getElementById('goalFill');
  const goalText = document.getElementById('goalText');
  const guideSpeech = document.getElementById('guideSpeech');

  if (badgeCount) badgeCount.textContent = String(allBadges.length || 0);
  if (pathCount) pathCount.textContent = String(paths);
  if (rankName) rankName.textContent = rank;
  if (goalFill) goalFill.style.width = progress + '%';
  if (goalText) goalText.textContent = progress + '%';

  if (guideSpeech) {
    const messages = paths === 4 ? [
      'Camp complete! You earned every path.',
      'You are a camp champion!',
      'Ready to replay your favorite path?'
    ] : paths === 3 ? [
      'One path left. You are close!',
      'Three paths complete. Keep going!',
      'Choose the final challenge.'
    ] : paths === 2 ? [
      'Two paths complete. Keep going!',
      'Choose another path to continue.',
      'Half the camp is complete!'
    ] : paths === 1 ? [
      'Nice start. Pick your next path!',
      'One path complete. Keep moving!',
      'Your next mission is waiting.'
    ] : [
      'Choose a path to start your adventure!',
      'Flight School is ready for takeoff!',
      'Field Lab needs a scientist!',
      'Expedition Corps needs an explorer!',
      'Storm Watch Station needs a weather observer!'
    ];
    guideSpeech.textContent = messages[Math.floor(Math.random() * messages.length)];
  }

  document.querySelectorAll('[data-go], a[href]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (link.dataset.navBound === 'yes') return;
      link.dataset.navBound = 'yes';
      event.preventDefault();
      playTone(620, .08);
      setTimeout(() => playTone(880, .1), 80);
      wipe?.classList.add('on');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
})();
