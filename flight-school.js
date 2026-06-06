(() => {
  const missions = [
    { key:'multiplication', title:'MULTIPLICATION CANYON', badge:'CANYON PILOT', bg:'bg-canyon.png', tag:'Fly through the right product.' },
    { key:'division', title:'DIVISION NEST', badge:'NEST NAVIGATOR', bg:'bg-nest.png', tag:'Share into equal groups.' },
    { key:'place', title:'PLACE VALUE PEAKS', badge:'PEAK CLIMBER', bg:'bg-peaks.png', tag:'Find hundreds, tens, and ones.' },
    { key:'rounding', title:'ROUNDING RAPIDS', badge:'RAPID RIDER', bg:'bg-rapids.png', tag:'Land on the nearest number.' },
    { key:'addition', title:'ADDITION AIRWAY', badge:'SUM SKY FLYER', bg:'bg-peaks.png', tag:'Add within 1,000.' },
    { key:'subtraction', title:'SUBTRACTION SKYWAY', badge:'DIFFERENCE DIVER', bg:'bg-ridge.png', tag:'Subtract within 1,000.' },
    { key:'multiples10', title:'TEN TIMES TRAIL', badge:'TENS ACE', bg:'bg-canyon.png', tag:'Multiply by multiples of 10.' },
    { key:'fractionsLine', title:'FRACTION FOREST', badge:'FOREST SCOUT', bg:'bg-forest.png', tag:'Find fractions on the trail.' },
    { key:'fractionCompare', title:'FRACTION LOOKOUT', badge:'FRACTION LOOKOUT', bg:'bg-forest.png', tag:'Compare fractions.' },
    { key:'partsWhole', title:'PARTS OF A WHOLE', badge:'WHOLE BUILDER', bg:'bg-area.png', tag:'Match parts to fractions.' },
    { key:'time', title:'TIME TOWER', badge:'TIME KEEPER', bg:'bg-tower.png', tag:'Read time to the nearest minute.' },
    { key:'area', title:'AREA OUTPOST', badge:'AREA BUILDER', bg:'bg-area.png', tag:'Count the square units.' },
    { key:'perimeter', title:'PERIMETER RIDGE', badge:'RIDGE RANGER', bg:'bg-ridge.png', tag:'Trace the outside path.' },
    { key:'word1', title:'WORD PROBLEM RUNWAY', badge:'STORY SOLVER', bg:'bg-camp.png', tag:'Solve one-step stories.' },
    { key:'word2', title:'CHAMPIONSHIP FLIGHT', badge:'SKY CHAMPION', bg:'bg-camp.png', tag:'Solve two-step stories.' }
  ];

  const $ = id => document.getElementById(id);
  const el = {
    start:$('startCard'), startBtn:$('startBtn'), complete:$('completeCard'), boss:$('bossBanner'), prompt:$('promptText'), answers:$('answerGrid'),
    q:$('questionCount'), lives:$('livesCount'), badges:$('badgeCount'), label:$('missionLabel'), title:$('missionTitle'), tag:$('missionTag'), flyer:$('falconFlyer'), rank:$('flightRank'), completeTitle:$('completeTitle'), completeText:$('completeText'), completeEyebrow:$('completeEyebrow')
  };
  let missionIndex = Number(localStorage.getItem('flightMissionIndex') || 0);
  missionIndex = Math.min(missionIndex, missions.length - 1);
  let question = 0, lives = 3, current = null, locked = false;
  const badgeSet = () => new Set(JSON.parse(localStorage.getItem('facBadges') || '[]'));
  const saveBadges = set => localStorage.setItem('facBadges', JSON.stringify([...set]));
  const tone = (freq=620,dur=.1,type='triangle') => { try{ const c=new(window.AudioContext||window.webkitAudioContext)(); const o=c.createOscillator(); const g=c.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(.0001,c.currentTime); g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.01); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+dur+.02);}catch(e){} };

  function setMission(){
    const m = missions[missionIndex];
    document.body.style.setProperty('--mission-bg', `url('${m.bg}')`);
    document.body.style.setProperty('--falcon-x', '10%');
    el.label.textContent = `MISSION ${missionIndex + 1}`;
    el.title.textContent = m.title;
    el.tag.textContent = m.tag;
    el.rank.textContent = missionIndex > 10 ? 'ACE PILOT' : missionIndex > 5 ? 'WING LEADER' : 'SKY SCOUT';
    el.badges.textContent = `BADGES: ${badgeSet().size}`;
  }
  function startMission(){
    question = 0; lives = 3; locked = false;
    el.start.classList.add('hidden');
    el.complete.classList.add('hidden');
    updateHud();
    nextQuestion();
  }
  function updateHud(){
    el.q.textContent = `QUESTION ${question}/15`;
    el.lives.textContent = `HEARTS: ${'♥ '.repeat(lives).trim()}`;
    el.badges.textContent = `BADGES: ${badgeSet().size}`;
    document.body.style.setProperty('--falcon-x', `${10 + (question/15)*76}%`);
  }
  function nextQuestion(){
    locked = false;
    if(question >= 15) return completeMission();
    if([5,10].includes(question)){ showBoss('BOSS ROUND!'); }
    const gen = FlightSchoolBank.generators[missions[missionIndex].key] || FlightSchoolBank.generators.multiplication;
    current = gen();
    el.prompt.textContent = current.prompt;
    el.answers.innerHTML = '';
    current.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.type = 'button';
      btn.textContent = choice;
      btn.addEventListener('click', () => answer(choice, btn));
      el.answers.appendChild(btn);
    });
    updateHud();
  }
  function showBoss(text){
    el.boss.textContent = text;
    el.boss.classList.remove('hidden');
    tone(180,.15,'sawtooth'); setTimeout(()=>tone(240,.15,'sawtooth'),140);
    setTimeout(()=>el.boss.classList.add('hidden'),900);
  }
  function answer(choice, btn){
    if(locked) return; locked = true;
    const ok = String(choice) === String(current.answer);
    if(ok){
      btn.classList.add('correct'); tone(740,.08); setTimeout(()=>tone(980,.1),70);
      question++;
      updateHud();
      if(question === 15){ showBoss('FINAL BOSS!'); setTimeout(nextQuestion,900); }
      else setTimeout(nextQuestion,520);
    }else{
      btn.classList.add('wrong'); tone(140,.18,'sawtooth'); lives--; updateHud();
      if(lives <= 0){
        el.prompt.textContent = 'Try this mission again.';
        el.answers.innerHTML = '<button class="primary-btn" type="button" id="retryBtn">RESTART MISSION</button>';
        document.getElementById('retryBtn').addEventListener('click', startMission);
      } else setTimeout(()=>{locked=false; btn.classList.remove('wrong')},500);
    }
  }
  function completeMission(){
    const m = missions[missionIndex];
    const badges = badgeSet(); badges.add(m.badge); saveBadges(badges);
    localStorage.setItem('flightMissionIndex', String(Math.min(missionIndex + 1, missions.length - 1)));
    el.completeEyebrow.textContent = 'BADGE EARNED';
    el.completeTitle.textContent = m.badge;
    if(missionIndex >= missions.length - 1){
      localStorage.setItem('flightComplete','yes');
      el.completeText.textContent = 'Flight School complete! Returning to camp...';
      el.complete.classList.remove('hidden');
      tone(520,.12); setTimeout(()=>tone(760,.12),130); setTimeout(()=>tone(1040,.18),260);
      setTimeout(()=>window.location.href='index.html',2400);
    }else{
      el.completeText.textContent = 'Next mission loading...';
      el.complete.classList.remove('hidden');
      tone(520,.12); setTimeout(()=>tone(760,.12),130); setTimeout(()=>tone(1040,.18),260);
      missionIndex++;
      setTimeout(()=>{ setMission(); startMission(); },2200);
    }
  }
  setMission();
  el.startBtn.addEventListener('click', startMission);
})();
