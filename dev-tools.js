(() => {
  const TRIGGER = 'dev';
  const STORAGE_KEYS = [
    'falconCampSave',
    'flight_school_badges_v19',
    'flight_school_progress_v19',
    'fs_badges',
    'fs_progress_v9',
    'pizzaParlorCollectibles',
    'rogersPizzaCollectibles',
    'fieldLabProgress',
    'expeditionProgress',
    'stormWatchProgress'
  ];

  const page = (() => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file.includes('flight')) return 'flight';
    if (file.includes('field')) return 'field';
    if (file.includes('expedition')) return 'expedition';
    if (file.includes('storm')) return 'storm';
    if (file.includes('pizza')) return 'pizza';
    return 'home';
  })();

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

  function completePage(){
    if (page === 'flight') {
      localStorage.setItem('flight_school_progress_v19', JSON.stringify({complete: Array.from({length:16},(_,i)=>i)}));
      localStorage.setItem('flight_school_badges_v19', JSON.stringify(Array.from({length:16},(_,i)=>`Flight Badge ${i+1}`)));
      writeCampSave({flightSchoolComplete:true});
      setText('Flight School marked complete. Reload the homepage to see progress update.');
      return;
    }
    if (page === 'field') {
      writeCampSave({fieldLabComplete:true});
      const n = clickVisible('[data-hotspot], [data-animal], .hotspot, .animal-tile', 30);
      setText(`Field Lab marked complete. Tried ${n} visible research clicks.`);
      return;
    }
    if (page === 'expedition') {
      writeCampSave({expeditionComplete:true});
      const n = clickVisible('[data-discover], .marker', 10);
      setText(`Expedition Corps marked complete. Tried ${n} visible discovery clicks.`);
      return;
    }
    if (page === 'storm') {
      writeCampSave({stormWatchComplete:true});
      setText('Severe Weather marked complete. This page is mainly a research station.');
      return;
    }
    if (page === 'pizza') {
      try {
        if (typeof score !== 'undefined') score = Math.max(score, 10);
        if (typeof round !== 'undefined') round = 5;
        if (typeof streak !== 'undefined') streak = Math.max(streak, 5);
        if (typeof updatePanel === 'function') updatePanel();
      } catch(e) {}
      localStorage.setItem('rogersPizzaCollectibles', JSON.stringify(['Golden Pizza','Master Chef','Secret Sauce']));
      setText('Pizza Parlor shift filled. Collectibles saved if supported.');
      return;
    }
    writeCampSave({
      flightSchoolComplete:true,
      fieldLabComplete:true,
      expeditionComplete:true,
      stormWatchComplete:true
    });
    setText('All four main camp paths marked complete. Reload if needed.');
  }

  function resetPage(){
    if (page === 'flight') {
      ['flight_school_progress_v19','flight_school_badges_v19','fs_badges','fs_progress_v9'].forEach(k=>localStorage.removeItem(k));
      writeCampSave({flightSchoolComplete:false});
      setText('Flight School progress reset.');
      return;
    }
    if (page === 'field') { writeCampSave({fieldLabComplete:false}); setText('Field Lab completion reset.'); return; }
    if (page === 'expedition') { writeCampSave({expeditionComplete:false}); setText('Expedition completion reset.'); return; }
    if (page === 'storm') { writeCampSave({stormWatchComplete:false}); setText('Severe Weather completion reset.'); return; }
    if (page === 'pizza') {
      ['pizzaParlorCollectibles','rogersPizzaCollectibles'].forEach(k=>localStorage.removeItem(k));
      try {
        if (typeof score !== 'undefined') score = 0;
        if (typeof round !== 'undefined') round = 0;
        if (typeof streak !== 'undefined') streak = 0;
        if (typeof updatePanel === 'function') updatePanel();
      } catch(e) {}
      setText('Pizza Parlor local extras reset.');
      return;
    }
    setText('No page-specific reset needed here.');
  }

  function clearAll(){
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    setText('Falcon Camp save keys cleared.');
  }

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
    if (page === 'pizza') {
      try {
        if (typeof current !== 'undefined' && current) {
          setText(`Current answer: ${current.answer}${(current.also||[]).length ? ' or ' + current.also.join(', ') : ''}`);
          return;
        }
      } catch(e) {}
    }
    const answers = [...document.querySelectorAll('[data-choice], [data-answer], .answer-btn, .choice, .clock-choice, .line-choice')]
      .slice(0, 14)
      .map(el => (el.dataset.choice || el.dataset.answer || el.textContent || '').trim())
      .filter(Boolean);
    setText(answers.length ? `Visible choices: ${answers.join(' | ')}` : 'No answer data found on this screen.');
  }

  function markCorrect(){
    if (page === 'pizza') {
      try {
        if (typeof current !== 'undefined' && current) {
          const answers = [current.answer, ...(current.also || [])];
          const btn = [...document.querySelectorAll('[data-choice]')].find(b => answers.includes(b.dataset.choice));
          if (btn && !btn.disabled) { btn.click(); setText(`Clicked correct answer: ${btn.dataset.choice}`); return; }
        }
      } catch(e) {}
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
      .fc-dev-grid button{background:#fff;color:#061b3d;border:2px solid #ffc83d;border-radius:14px;padding:9px 10px;font-weight:900;cursor:pointer}
      .fc-dev-grid button:hover{background:#ffc83d}
      .fc-dev-output{margin-top:10px;background:#fff8d8;color:#061b3d;border-radius:14px;padding:10px;font-size:14px;line-height:1.35;min-height:42px;font-weight:900;white-space:pre-wrap}
      @media(max-width:720px){.fc-dev-panel{left:10px;right:10px;bottom:10px;width:auto}.fc-dev-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    const panel = document.createElement('div');
    panel.id = 'fcDevPanel';
    panel.className = 'fc-dev-panel';
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
      </div>
      <div class="fc-dev-output" id="fcDevOutput">Ready.</div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('.fc-dev-close').addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', e => {
      const btn = e.target.closest('[data-fcdev]');
      if (!btn) return;
      const a = btn.dataset.fcdev;
      if (a === 'complete') completePage();
      if (a === 'answer') showAnswers();
      if (a === 'correct') markCorrect();
      if (a === 'reveal') revealClickables();
      if (a === 'next') nextScreen();
      if (a === 'prev') previousScreen();
      if (a === 'home') jumpHome();
      if (a === 'reset') resetPage();
      if (a === 'clear') clearAll();
      if (a === 'reload') location.reload();
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