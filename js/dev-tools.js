(() => {
  const TRIGGER = 'dev';

  // ── All localStorage keys the game writes ─────────────────────────────────
  // falconCampSave holds all path/completion flags as nested keys.
  // The others are standalone keys for Flight School and Pizza.
  const STORAGE_KEYS = [
    'falconCampSave',
    'flight_school_badges_v19',
    'flight_school_progress_v19',
    'fs_badges',
    'fs_progress_v9',
    'pizzaParlorCollectibles',
    'rogersPizzaCollectibles'
  ];

  // ── Page detection ────────────────────────────────────────────────────────
  const page = (() => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file.includes('flight'))     return 'flight';
    if (file.includes('field'))      return 'field';
    if (file.includes('expedition')) return 'expedition';
    if (file.includes('storm'))      return 'storm';
    if (file.includes('pizza'))      return 'pizza';
    if (file.includes('prinslow') || file.includes('palace')) return 'palace';
    return 'home';
  })();

  // ── Utilities ─────────────────────────────────────────────────────────────
  function safeJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch(e){ return fallback; }
  }

  function writeCampSave(patch){
    const save = safeJSON('falconCampSave', {});
    localStorage.setItem('falconCampSave', JSON.stringify({...save, ...patch}));
  }

  function showScreen(id){
    const screens = [...document.querySelectorAll('.screen')];
    const target = document.getElementById(id);
    if (screens.length && target) {
      screens.forEach(s => s.classList.remove('active'));
      target.classList.add('active');
      window.scrollTo(0,0);
      return true;
    }
    return false;
  }

  function getScreens(){
    return [...document.querySelectorAll('.screen')].map(s => s.id).filter(Boolean);
  }

  function activeScreenId(){
    const s = document.querySelector('.screen.active');
    return s?.id || 'none';
  }

  function clickVisible(selector, limit = 99){
    const items = [...document.querySelectorAll(selector)]
      .filter(el => !el.disabled && el.offsetParent !== null)
      .slice(0, limit);
    items.forEach((el, i) => setTimeout(() => el.click(), i * 80));
    return items.length;
  }

  function setText(msg){
    const box = document.getElementById('fcDevOutput');
    if (box) box.textContent = msg;
  }

  // ── Complete page ─────────────────────────────────────────────────────────
  // If the page exposes window.FalconDev.complete(), use it — that's the
  // authoritative source for each page's own completion logic.
  // Abort any live room signal first so stale listeners don't fire.
  function completePage(){
    // Clean up any active room event listeners before calling complete
    if (window._abortController) {
      window._abortController.abort();
      window._abortController = null;
    }

    if (window.FalconDev?.complete) {
      const result = window.FalconDev.complete();
      setText(result || 'Page marked complete via FalconDev.');
      return;
    }

    // Generic fallbacks for pages without FalconDev
    if (page === 'flight') {
      localStorage.setItem('flight_school_progress_v19', JSON.stringify({complete: Array.from({length:16},(_,i)=>i), unlocked:15, xp:800}));
      localStorage.setItem('flight_school_badges_v19', JSON.stringify(Array.from({length:16},(_,i)=>`Flight Badge ${i+1}`)));
      writeCampSave({flightSchoolComplete:true});
      setText('Flight School marked complete.');
      return;
    }
    if (page === 'field') {
      writeCampSave({fieldLabComplete:true});
      const n = clickVisible('[data-hotspot], [data-animal], .hotspot, .animal-tile', 30);
      setText(`Field Lab marked complete. Tried ${n} visible clicks.`);
      return;
    }
    if (page === 'expedition') {
      writeCampSave({expeditionComplete:true});
      const n = clickVisible('[data-discover], .marker', 10);
      setText(`Expedition Corps marked complete. Tried ${n} visible clicks.`);
      return;
    }
    if (page === 'storm') {
      writeCampSave({stormWatchComplete:true});
      setText('Severe Weather marked complete.');
      return;
    }
    if (page === 'palace') {
      writeCampSave({prinslowPalaceComplete:true, prinslowPalaceProgress:7});
      setText('Prinslow Palace marked complete.');
      return;
    }
    if (page === 'pizza') {
      localStorage.setItem('rogersPizzaCollectibles', JSON.stringify(['Golden Pizza','Master Chef','Secret Sauce']));
      setText('Pizza Parlor collectibles saved.');
      return;
    }
    // Home — mark everything complete
    writeCampSave({
      flightSchoolComplete:true,
      fieldLabComplete:true,
      expeditionComplete:true,
      stormWatchComplete:true,
      prinslowPalaceComplete:true,
      prinslowPalaceProgress:7
    });
    setText('All paths and special adventures marked complete. Reload to see homepage update.');
  }

  // ── Reset page ────────────────────────────────────────────────────────────
  function resetPage(){
    if (window.FalconDev?.reset) {
      const result = window.FalconDev.reset();
      setText(result || 'Page reset via FalconDev.');
      return;
    }

    if (page === 'flight') {
      ['flight_school_progress_v19','flight_school_badges_v19','fs_badges','fs_progress_v9'].forEach(k=>localStorage.removeItem(k));
      writeCampSave({flightSchoolComplete:false});
      setText('Flight School progress reset.');
      return;
    }
    if (page === 'field')      { writeCampSave({fieldLabComplete:false});      setText('Field Lab reset.');           return; }
    if (page === 'expedition') { writeCampSave({expeditionComplete:false});    setText('Expedition Corps reset.');    return; }
    if (page === 'storm')      { writeCampSave({stormWatchComplete:false});     setText('Severe Weather reset.');      return; }
    if (page === 'palace')     { writeCampSave({prinslowPalaceComplete:false, prinslowPalaceProgress:0}); setText('Prinslow Palace reset.'); return; }
    if (page === 'pizza') {
      ['pizzaParlorCollectibles','rogersPizzaCollectibles'].forEach(k=>localStorage.removeItem(k));
      setText('Pizza Parlor extras reset.');
      return;
    }
    setText('No page-specific reset for this page.');
  }

  // ── Clear all saves ───────────────────────────────────────────────────────
  // Reloads after clearing so the UI reflects the cleared state immediately.
  function clearAll(){
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    setText('All save data cleared. Reloading...');
    setTimeout(() => location.reload(), 700);
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  function nextScreen(){
    const screens = getScreens();
    if (!screens.length) { setText('No screens found on this page.'); return; }
    const current = activeScreenId();
    const idx = Math.max(0, screens.indexOf(current));
    const next = screens[(idx + 1) % screens.length];
    showScreen(next);
    setText(`Screen: ${next}`);
  }

  function previousScreen(){
    const screens = getScreens();
    if (!screens.length) { setText('No screens found on this page.'); return; }
    const current = activeScreenId();
    const idx = screens.indexOf(current);
    const prev = screens[(idx <= 0 ? screens.length : idx) - 1];
    showScreen(prev);
    setText(`Screen: ${prev}`);
  }

  function showAnswers(){
    if (window.FalconDev?.actions) {
      const showAction = window.FalconDev.actions.find(a => a.label === 'Show Answer');
      if (showAction) { setText(showAction.run()); return; }
    }
    const answers = [...document.querySelectorAll('[data-choice], [data-answer], .answer-btn, .choice, .clock-choice, .line-choice')]
      .slice(0, 14)
      .map(el => (el.dataset.choice || el.dataset.answer || el.textContent || '').trim())
      .filter(Boolean);
    setText(answers.length ? `Visible choices: ${answers.join(' | ')}` : 'No answer data found on this screen.');
  }

  function markCorrect(){
    if (window.FalconDev?.actions) {
      const correctAction = window.FalconDev.actions.find(a => a.label === 'Mark Correct' || a.label === 'Correct Current');
      if (correctAction) { setText(correctAction.run()); return; }
    }
    const clicked = clickVisible('[data-correct="true"], [aria-label*="correct" i], .correct', 1);
    setText(clicked ? 'Clicked a visible correct control.' : 'No obvious correct control found on this screen.');
  }

  function revealClickables(){
    const n = clickVisible('[data-discover], [data-hotspot], [data-animal], .marker, .hotspot, .animal-tile', 40);
    setText(n ? `Clicked ${n} visible discovery controls.` : 'No visible discovery controls found.');
  }

  function jumpHome(){
    if (showScreen('home')) setText('Jumped to page home screen.');
    else location.href = 'index.html';
  }

  // ── Panel builder ─────────────────────────────────────────────────────────
  // Builds the standard 10-button grid, then appends any page-specific
  // actions exposed via window.FalconDev.actions so each page automatically
  // gets its own extra controls without changing this file.
  function makePanel(){
    if (document.getElementById('fcDevPanel')) return;

    const style = document.createElement('style');
    style.textContent = `
      .fc-dev-panel{position:fixed;right:16px;bottom:16px;z-index:100000;width:min(390px,94vw);background:rgba(6,27,61,.96);color:#fff;border:4px solid #ffc83d;border-radius:22px;box-shadow:0 20px 55px rgba(0,0,0,.42);padding:14px;font-family:Atkinson Hyperlegible,system-ui,sans-serif;display:none}
      .fc-dev-panel.show{display:block}
      .fc-dev-head{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:10px}
      .fc-dev-head h2{font-family:Bungee,system-ui;margin:0;font-size:22px;line-height:1;color:#fff}
      .fc-dev-close{background:transparent;color:#fff;border:0;font-size:24px;font-weight:900;cursor:pointer}
      .fc-dev-note{font-size:14px;line-height:1.35;margin:0 0 10px;color:#fff8d8;font-weight:800}
      .fc-dev-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
      .fc-dev-grid button{background:#fff;color:#061b3d;border:2px solid #ffc83d;border-radius:14px;padding:9px 10px;font-weight:900;cursor:pointer;text-align:left}
      .fc-dev-grid button:hover{background:#ffc83d}
      .fc-dev-divider{grid-column:1/-1;border:0;border-top:2px solid rgba(255,200,61,.3);margin:4px 0}
      .fc-dev-section{grid-column:1/-1;font-size:12px;font-weight:900;color:#ffc83d;letter-spacing:.08em;margin:4px 0 0}
      .fc-dev-output{margin-top:10px;background:#fff8d8;color:#061b3d;border-radius:14px;padding:10px;font-size:14px;line-height:1.35;min-height:42px;font-weight:900;white-space:pre-wrap}
      @media(max-width:720px){.fc-dev-panel{left:10px;right:10px;bottom:10px;width:auto}.fc-dev-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'fcDevPanel';
    panel.className = 'fc-dev-panel';

    // Build page-specific action buttons from window.FalconDev.actions
    const pageActions = window.FalconDev?.actions || [];
    const pageActionsHTML = pageActions.length
      ? `<hr class="fc-dev-divider">
         <div class="fc-dev-section">${(window.FalconDev?.site || page).toUpperCase()}</div>
         ${pageActions.map((a, i) =>
           `<button type="button" data-fcdev-page="${i}">${a.label}</button>`
         ).join('')}`
      : '';

    panel.innerHTML = `
      <div class="fc-dev-head">
        <h2>DEV MODE</h2>
        <button class="fc-dev-close" type="button" aria-label="Close dev panel">×</button>
      </div>
      <p class="fc-dev-note">Type <strong>dev</strong> to toggle. Page: <strong>${page}</strong>. Screen: <strong id="fcDevScreen">${activeScreenId()}</strong>.</p>
      <div class="fc-dev-grid">
        <button type="button" data-fcdev="complete">Complete Page</button>
        <button type="button" data-fcdev="answer">Show Answer</button>
        <button type="button" data-fcdev="correct">Mark Correct</button>
        <button type="button" data-fcdev="reveal">Reveal Clickables</button>
        <button type="button" data-fcdev="next">Next Screen</button>
        <button type="button" data-fcdev="prev">Previous Screen</button>
        <button type="button" data-fcdev="home">Jump Home</button>
        <button type="button" data-fcdev="reset">Reset Page</button>
        <button type="button" data-fcdev="clear">Clear All Saves</button>
        <button type="button" data-fcdev="reload">Reload</button>
        ${pageActionsHTML}
      </div>
      <div class="fc-dev-output" id="fcDevOutput">Ready.</div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('.fc-dev-close').addEventListener('click', () => panel.classList.remove('show'));

    panel.addEventListener('click', e => {
      const btn = e.target.closest('[data-fcdev]');
      const pageBtn = e.target.closest('[data-fcdev-page]');

      if (pageBtn) {
        // Page-specific action from window.FalconDev.actions
        const idx = Number(pageBtn.dataset.fcdevPage);
        const action = (window.FalconDev?.actions || [])[idx];
        if (action) setText(action.run());
      } else if (btn) {
        const a = btn.dataset.fcdev;
        if (a === 'complete') completePage();
        if (a === 'answer')   showAnswers();
        if (a === 'correct')  markCorrect();
        if (a === 'reveal')   revealClickables();
        if (a === 'next')     nextScreen();
        if (a === 'prev')     previousScreen();
        if (a === 'home')     jumpHome();
        if (a === 'reset')    resetPage();
        if (a === 'clear')    clearAll();
        if (a === 'reload')   location.reload();
      }

      const screen = document.getElementById('fcDevScreen');
      if (screen) screen.textContent = activeScreenId();
    });
  }

  function togglePanel(){
    makePanel();
    const panel = document.getElementById('fcDevPanel');
    panel.classList.toggle('show');
    const screen = document.getElementById('fcDevScreen');
    if (screen) screen.textContent = activeScreenId();
    setText(`Ready on ${page}.`);
  }

  // ── Keyboard trigger ──────────────────────────────────────────────────────
  let buffer = '';
  document.addEventListener('keydown', e => {
    const tag = (e.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length);
    if (buffer === TRIGGER) {
      e.preventDefault();
      buffer = '';
      togglePanel();
    }
  });
})();
