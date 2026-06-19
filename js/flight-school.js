(function(){
  const $ = id => document.getElementById(id);
  const missions = window.FS_QUESTIONS.missions || [];
  const storeKey = "flight_school_progress_v19";
  const badgeKey = "flight_school_badges_v19";

  const els = {
    scene: $("sceneWindow"),
    missionLabel: $("missionLabel"),
    missionTitle: $("missionTitle"),
    missionTag: $("missionTag"),
    falcon: $("falconFlyer"),
    startCard: $("startCard"),
    startText: $("startText"),
    startBtn: $("startBtn"),
    resetBtn: $("resetBtn"),
    boss: $("bossBanner"),
    complete: $("completeCard"),
    completeEyebrow: $("completeEyebrow"),
    completeTitle: $("completeTitle"),
    completeText: $("completeText"),
    continueBtn: $("continueBtn"),
    questionCount: $("questionCount"),
    livesCount: $("livesCount"),
    badgeCount: $("badgeCount"),
    progressFill: $("progressFill"),
    prompt: $("promptText"),
    feedback: $("feedbackText"),
    grid: $("answerGrid")
  };

  let progress = loadProgress();
  let current = Math.min(progress.unlocked || 0, missions.length - 1);
  let questions = [];
  let qIndex = 0;
  let lives = 3;
  let locked = false;
  let autoTimer = null;

  function loadProgress(){
    try {
      return JSON.parse(localStorage.getItem(storeKey)) || {unlocked:0, complete:[], xp:0};
    } catch(e) {
      return {unlocked:0, complete:[], xp:0};
    }
  }

  function saveProgress(){
    localStorage.setItem(storeKey, JSON.stringify(progress));
  }

  function getBadges(){
    try { return JSON.parse(localStorage.getItem(badgeKey)) || []; }
    catch(e){ return []; }
  }

  function saveBadge(name){
    const badges = getBadges();
    if(!badges.includes(name)){
      badges.push(name);
      localStorage.setItem(badgeKey, JSON.stringify(badges));
    }
  }

  function sound(kind){
    try{
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = kind === "wrong" ? "sawtooth" : "triangle";
      const start = ctx.currentTime;
      const notes = {
        correct:[740,880],
        wrong:[190,130],
        boss:[220,330,440],
        win:[523,659,784],
        start:[440,660]
      }[kind] || [600];
      gain.gain.value = 0.045;
      osc.frequency.value = notes[0];
      notes.forEach((n,i)=>osc.frequency.setValueAtTime(n,start+i*.08));
      gain.gain.exponentialRampToValueAtTime(.001,start+.34);
      osc.start(start);
      osc.stop(start+.36);
    }catch(e){}
  }

  function setMissionVisual(){
    const m = missions[current];
    document.body.style.setProperty("--mission-bg", `url('${m.bg}')`);
    document.body.style.setProperty("--falcon-x", "8%");
    els.missionLabel.textContent = `MISSION ${current + 1}`;
    els.missionTitle.textContent = m.name;
    els.missionTag.textContent = m.tag || "Choose the correct path.";
    els.boss.classList.add("hidden");
    els.complete.classList.add("hidden");
    els.startCard.classList.remove("hidden");
    els.falcon.classList.remove("boost","shake");
    updateHud();
  }

  function updateHud(){
    const qText = questions.length ? `QUESTION ${Math.min(qIndex + 1, questions.length)}/15` : "QUESTION 0/15";
    els.questionCount.textContent = qText;
    els.livesCount.textContent = "HEARTS: " + "♥ ".repeat(lives) + "♡ ".repeat(3-lives);
    els.badgeCount.textContent = `BADGES: ${getBadges().length}`;
    const pct = questions.length ? Math.round((qIndex / questions.length) * 100) : 0;
    els.progressFill.style.width = `${pct}%`;
  }

  function showStart(){
    clearTimeout(autoTimer);
    setMissionVisual();
    const m = missions[current];
    els.startText.textContent = current === 0
      ? "Beat 15 challenges. Keep your 3 hearts."
      : `${m.name} is unlocked. Keep flying.`;
    els.prompt.textContent = "Press start.";
    els.feedback.textContent = "";
    els.grid.innerHTML = "";
    els.complete.classList.add("hidden");
    els.startCard.classList.remove("hidden");
  }

  function startMission(index=current){
    clearTimeout(autoTimer);
    current = Math.max(0, Math.min(index, missions.length-1));
    const m = missions[current];
    questions = window.FS_QUESTIONS.makeMissionQuestions(m.id, 15);
    qIndex = 0;
    lives = 3;
    locked = false;
    setMissionVisual();
    els.startCard.classList.add("hidden");
    els.complete.classList.add("hidden");
    sound("start");
    renderQuestion();
  }

  function renderQuestion(){
    locked = false;
    const q = questions[qIndex];
    const m = missions[current];
    const isBoss = [4,9,14].includes(qIndex);

    els.scene.classList.remove("flash-correct","flash-wrong");
    els.falcon.classList.remove("boost","shake");
    els.grid.innerHTML = "";
    els.feedback.textContent = "";
    els.prompt.textContent = q.prompt;
    els.boss.textContent = qIndex === 14 ? "MISSION BOSS!" : "MINI BOSS!";
    els.boss.classList.toggle("hidden", !isBoss);
    if(isBoss) sound("boss");

    const x = 8 + (qIndex / questions.length) * 72;
    document.body.style.setProperty("--falcon-x", `${x}%`);
    updateHud();

    const type = q.kind || m.type || "choice";
    if(type === "input") renderInput(q);
    else if(type === "line") renderLine(q);
    else if(type === "clock") renderClock(q);
    else renderChoices(q, m.type || "cloud");
  }

  function renderChoices(q, visualType){
    const options = q.options || [];
    options.forEach(opt=>{
      const b = document.createElement("button");
      b.type = "button";
      b.className = `answer-btn ${visualType || "cloud"}`;
      b.textContent = opt;
      b.addEventListener("click",()=>submitAnswer(b,opt,q));
      els.grid.appendChild(b);
    });
  }

  function renderInput(q){
    const wrap = document.createElement("div");
    wrap.className = "input-wrap";
    wrap.style.gridColumn = "1 / -1";

    const helper = document.createElement("div");
    helper.className = "input-helper";
    helper.textContent = q.helper || "Type your answer, then launch it.";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = q.inputMode || "text";
    input.placeholder = q.placeholder || "Type answer";
    input.autocomplete = "off";
    input.setAttribute("aria-label","Type your answer");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "primary-btn";
    btn.textContent = "LAUNCH ANSWER";

    const go = () => submitAnswer(btn, input.value, q, input);
    btn.addEventListener("click", go);
    input.addEventListener("keydown", e => { if(e.key === "Enter") go(); });

    wrap.append(helper, input, btn);
    els.grid.appendChild(wrap);
    setTimeout(()=>input.focus(),80);
  }

  function renderLine(q){
    const line = document.createElement("div");
    line.className = "number-line";
    (q.options || []).forEach(opt=>{
      const b = document.createElement("button");
      b.type = "button";
      b.className = "line-choice";
      b.textContent = opt;
      b.addEventListener("click",()=>submitAnswer(b,opt,q));
      line.appendChild(b);
    });
    els.grid.appendChild(line);
  }

  function renderClock(q){
    (q.options || []).forEach(opt=>{
      const [h,m] = String(opt).split(":").map(Number);
      const hourRot = ((h % 12) * 30) + (m * .5);
      const minRot = m * 6;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "clock-choice";
      b.innerHTML = `<div class="clock-face" style="--hourRot:${hourRot}deg;--minRot:${minRot}deg"></div><span>${opt}</span>`;
      b.addEventListener("click",()=>submitAnswer(b,opt,q));
      els.grid.appendChild(b);
    });
  }

  function normalize(v){
    return String(v).toLowerCase()
      .replace(/,/g,"")
      .replace(/\s+/g,"")
      .replace(/×/g,"x")
      .replace(/–/g,"-");
  }

  function isCorrect(value,q){
    const accepted = q.answers || [q.answer];
    return accepted.map(normalize).includes(normalize(value));
  }

  function submitAnswer(button,value,q,input){
    if(locked) return;
    locked = true;

    if(isCorrect(value,q)){
      button.classList.add("correct");
      if(input) input.classList.add("correct");
      correct();
    } else {
      button.classList.add("wrong");
      if(input) input.classList.add("wrong");
      wrong(button,input);
    }
  }

  function missionPraise(){
    const id = missions[current]?.id || '';
    const byMission = {
      multiplication:['CANYON CLEARED!','PRODUCT FOUND!','MATH BOOST!'],
      division:['NEST LANDING!','GROUPS SOLVED!','SAFE PERCH!'],
      oneStep:['RUNWAY CLEAR!','STORY SOLVED!','GOOD READING!'],
      twoStep:['SKYWAY SOLVED!','BOTH STEPS DONE!','SMART FLIGHT!'],
      placeValue:['PEAK BUILT!','VALUE FOUND!','NUMBER MASTER!'],
      rounding:['RAPIDS CLEARED!','ROUNDING RIDER!','SAFE LANDING!'],
      addition:['OUTPOST BUILT!','SUM FOUND!','ADDITION BOOST!'],
      subtraction:['RIDGE CROSSED!','DIFFERENCE FOUND!','STRONG SUBTRACTING!'],
      tens:['TENS TAKEOFF!','TEN BOOST!','MULTIPLYING BY TENS!'],
      fracLine:['TRAIL FOUND!','FRACTION SPOTTED!','FOREST PATH CLEAR!'],
      fracCompare:['DUEL WON!','GREATER FRACTION!','FRACTION SCOUT!'],
      partsWhole:['WHOLE BUILT!','EQUAL PARTS!','SHAPE SOLVED!'],
      time:['CLOCK MASTER!','TIME FOUND!','TOWER CLEARED!'],
      area:['OUTPOST MAPPED!','AREA FOUND!','SQUARE UNITS!'],
      perimeter:['RIDGE TRACED!','PERIMETER FOUND!','OUTSIDE DISTANCE!'],
      partition:['SHAPE SPLIT!','EQUAL SHARES!','PARTITION PRO!']
    };
    const list = byMission[id] || ['NICE FLIGHT!','GOOD BOOST!','YOU GOT IT!','KEEP FLYING!'];
    return list[Math.floor(Math.random()*list.length)];
  }

  function correct(){
    qIndex++;
    progress.xp = (progress.xp || 0) + 10;
    els.feedback.textContent = missionPraise();
    els.scene.classList.add("flash-correct");
    els.falcon.classList.add("boost");
    sound("correct");

    const x = 8 + (qIndex / questions.length) * 82;
    document.body.style.setProperty("--falcon-x", `${Math.min(90,x)}%`);
    updateHud();

    autoTimer = setTimeout(()=>{
      if(qIndex >= questions.length) completeMission();
      else renderQuestion();
    },700);
  }

  function wrong(button,input){
    lives--;
    els.feedback.textContent = lives > 0 ? "CHECK THE PATH!" : "MISSION RESET!";
    els.scene.classList.add("flash-wrong");
    els.falcon.classList.add("shake");
    sound("wrong");
    updateHud();

    if(lives <= 0){
      autoTimer = setTimeout(()=>startMission(current),1800);
      return;
    }

    autoTimer = setTimeout(()=>{
      button.classList.remove("wrong");
      if(input){
        input.classList.remove("wrong");
        input.value = "";
        input.focus();
      }
      els.scene.classList.remove("flash-wrong");
      els.falcon.classList.remove("shake");
      els.feedback.textContent = "";
      locked = false;
    },850);
  }

  function completeMission(){
    const m = missions[current];
    progress.complete = [...new Set([...(progress.complete || []), current])];
    if(current >= (progress.unlocked || 0) && current < missions.length - 1){
      progress.unlocked = current + 1;
    }
    progress.xp = (progress.xp || 0) + 50;
    saveBadge(m.badge);
    saveProgress();

    els.progressFill.style.width = "100%";
    els.boss.classList.add("hidden");
    els.completeEyebrow.textContent = current === missions.length - 1 ? "FLIGHT SCHOOL COMPLETE" : "BADGE EARNED";
    els.completeTitle.textContent = m.badge;
    els.completeText.textContent = current === missions.length - 1 ? "You finished every Flight School mission." : "Next mission unlocked. Keep flying.";
    els.complete.classList.remove("hidden");
    els.continueBtn.textContent = current === missions.length - 1 ? "RETURN TO START" : "NEXT MISSION";
    sound("win");

    // No auto-advance — the NEXT MISSION button lets the student
    // read their badge and move on at their own pace.
    if(current === missions.length - 1){
      // Mark Flight School complete on the camp save when all missions done
      try {
        const save = JSON.parse(localStorage.getItem("falconCampSave")) || {};
        save.flightSchoolComplete = true;
        localStorage.setItem("falconCampSave", JSON.stringify(save));
      } catch(e) {}
    }
  }

  els.startBtn.addEventListener("click",()=>startMission(Math.min(progress.unlocked || 0, missions.length-1)));
  els.continueBtn.addEventListener("click",()=>{
    if(current < missions.length - 1) startMission(current + 1);
    else showStart();
  });
  els.resetBtn.addEventListener("click",()=>{
    if(confirm("Reset Flight School progress?")){
      localStorage.removeItem(storeKey);
      localStorage.removeItem(badgeKey);
      try {
        const save = JSON.parse(localStorage.getItem("falconCampSave")) || {};
        save.flightSchoolComplete = false;
        localStorage.setItem("falconCampSave", JSON.stringify(save));
      } catch(e) {}
      progress = loadProgress();
      current = 0;
      questions = [];
      qIndex = 0;
      lives = 3;
      showStart();
    }
  });

  if(!missions.length){
    els.prompt.textContent = "Question bank did not load.";
    return;
  }


  window.FalconDev = {
    site: "Flight School",
    complete(){
      progress.unlocked = missions.length ? missions.length - 1 : 0;
      progress.complete = missions.map((_, i) => i);
      progress.xp = Math.max(progress.xp || 0, missions.length * 50);
      saveProgress();
      missions.forEach(m => m.badge && saveBadge(m.badge));
      try {
        const save = JSON.parse(localStorage.getItem("falconCampSave")) || {};
        save.flightSchoolComplete = true;
        localStorage.setItem("falconCampSave", JSON.stringify(save));
      } catch(e) {}
      updateHud();
      return "Flight School marked complete.";
    },
    reset(){
      localStorage.removeItem(storeKey);
      localStorage.removeItem(badgeKey);
      try {
        const save = JSON.parse(localStorage.getItem("falconCampSave")) || {};
        save.flightSchoolComplete = false;
        localStorage.setItem("falconCampSave", JSON.stringify(save));
      } catch(e) {}
      progress = loadProgress();
      current = 0; questions = []; qIndex = 0; lives = 3;
      showStart();
      return "Flight School reset.";
    },
    actions: [
      {label:"Start Mission", run(){ startMission(Math.min(progress.unlocked || 0, missions.length - 1)); return "Mission started."; }},
      {label:"Next Mission", run(){ startMission(Math.min(current + 1, missions.length - 1)); return "Next mission opened."; }},
      {label:"Show Answer", run(){ const q = questions[qIndex]; return q ? "Answer: " + ((q.answers || [q.answer]).join(" or ")) : "No active question."; }},
      {label:"Correct Current", run(){ const q = questions[qIndex]; if(!q) return "No active question."; correct(); return "Marked current answer correct."; }},
      {label:"Complete Mission", run(){ completeMission(); return "Mission completed."; }}
    ]
  };

  showStart();
})();