(() => {
  const wipe = document.getElementById('screenWipe');
  const playTone = (freq = 620, dur = 0.1, type = 'triangle') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  };

  const badges = JSON.parse(localStorage.getItem('facBadges') || '[]');
  const complete = ['flightComplete','labComplete','expeditionComplete'].filter(k => localStorage.getItem(k) === 'yes').length;
  const badgePill = document.getElementById('badgePill');
  const pathPill = document.getElementById('pathPill');
  const rankPill = document.getElementById('rankPill');
  if (badgePill) badgePill.textContent = `BADGES: ${badges.length}`;
  if (pathPill) pathPill.textContent = `PATHS: ${complete}/3`;
  if (rankPill) rankPill.textContent = complete >= 3 ? 'RANK: CAMP CHAMPION' : complete >= 1 ? 'RANK: TRAIL BLAZER' : 'RANK: SKY SCOUT';

  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      event.preventDefault();
      playTone(640, .08);
      setTimeout(() => playTone(880, .12), 70);
      wipe?.classList.add('on');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
})();
