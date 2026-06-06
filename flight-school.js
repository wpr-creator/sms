(function(){
  const $=id=>document.getElementById(id);
  const missions=window.FS_QUESTIONS.missions;
  const storeKey='fs_progress_v9';
  const badgeKey='fs_badges';
  let state=load();
  let current=0, questions=[], qIndex=0, lives=3, locked=false;
  const els={
    missionName:$('missionName'), questionCount:$('questionCount'), lifeText:$('lifeText'), xpText:$('xpText'), missionMap:$('missionMap'),
    stageBg:$('stageBackground'), stage:$('flightStage'), falcon:$('pilotFalcon'), boss:$('bossBadge'),
    startCard:$('startCard'), startTitle:$('startTitle'), startBtn:$('startBtn'), resetBtn:$('resetBtn'), challengeCard:$('challengeCard'),
    prompt:$('promptText'), zone:$('interactiveZone'), feedback:$('feedbackText'), type:$('challengeType'),
    complete:$('completeCard'), completeTitle:$('completeTitle'), completeLabel:$('completeLabel'), continueBtn:$('continueBtn')
  };
  function load(){try{return JSON.parse(localStorage.getItem(storeKey))||{unlocked:0,xp:0,complete:[]}}catch(e){return{unlocked:0,xp:0,complete:[]}}}
  function save(){localStorage.setItem(storeKey,JSON.stringify(state));}
  function getBadges(){try{return JSON.parse(localStorage.getItem(badgeKey))||[]}catch(e){return[]}}
  function saveBadge(name){const b=getBadges(); if(!b.includes(name)){b.push(name);localStorage.setItem(badgeKey,JSON.stringify(b));}}
  function sound(kind){try{const A=window.AudioContext||window.webkitAudioContext;const a=new A();const o=a.createOscillator();const g=a.createGain();o.connect(g);g.connect(a.destination);o.type=kind==='wrong'?'sawtooth':'triangle';let f=kind==='wrong'?160:kind==='boss'?220:kind==='win'?523:740;o.frequency.value=f;g.gain.value=.05;o.start();if(kind==='win'){o.frequency.setValueAtTime(659,a.currentTime+.08);o.frequency.setValueAtTime(784,a.currentTime+.16)}if(kind==='boss'){o.frequency.setValueAtTime(330,a.currentTime+.08)}g.gain.exponentialRampToValueAtTime(.001,a.currentTime+(kind==='win'?.32:.14));o.stop(a.currentTime+(kind==='win'?.34:.16))}catch(e){}}
  function renderMap(){els.missionMap.innerHTML='';missions.forEach((m,i)=>{const n=document.createElement('div');n.className='map-node '+(state.complete.includes(i)?'done ':i===current?'current ':'')+(i>state.unlocked?'locked':'');n.textContent=i>state.unlocked?'LOCKED':m.name.split(' ')[0];els.missionMap.appendChild(n);});}
  function setMissionVisual(i){const m=missions[i];els.missionName.textContent=m.name;els.stageBg.style.backgroundImage=`linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.1)), url('${m.bg}')`;els.stage.className='flight-stage scene-'+m.id;els.boss.classList.remove('show');positionFalcon(0);}
  function positionFalcon(progress){els.falcon.style.left=(Math.max(0,Math.min(1,progress))*82)+'%';}
  function updateHud(){els.lifeText.textContent='❤ '.repeat(lives).trim()+' ♡ '.repeat(3-lives).trim();els.xpText.textContent='XP '+state.xp;els.questionCount.textContent=questions.length?`${Math.min(qIndex+1,15)}/15`:'READY';}
  function show(view){els.startCard.classList.toggle('hidden',view!=='start');els.challengeCard.classList.toggle('hidden',view!=='play');els.complete.classList.toggle('hidden',view!=='complete');}
  function boot(){current=Math.min(state.unlocked,missions.length-1);renderMap();setMissionVisual(current);updateHud();els.startTitle.textContent=state.unlocked===0?'READY FOR TAKEOFF?':'KEEP FLYING';show('start');}
  function startMission(i=current){current=i;questions=window.FS_QUESTIONS.makeMissionQuestions(missions[current].id,15);qIndex=0;lives=3;locked=false;setMissionVisual(current);renderMap();updateHud();show('play');renderQuestion();}
  function renderQuestion(){locked=false;const q=questions[qIndex];const m=missions[current];const isBoss=[4,9,14].includes(qIndex);els.boss.textContent=qIndex===14?'MISSION BOSS':'MINI BOSS';els.boss.classList.toggle('show',isBoss);if(isBoss)sound('boss');els.type.textContent=isBoss?'BOSS ROUND':m.name;els.prompt.textContent=q.prompt;els.feedback.textContent='';els.zone.innerHTML='';els.zone.className='interactive-zone type-'+(q.kind||m.type||'choice');const type=q.kind==='line'?'line':q.kind==='clock'?'clock':m.type;
    if(q.kind==='input') renderInput(q); else if(type==='line') renderLine(q); else if(type==='clock') renderClock(q); else renderButtons(q,type);
    positionFalcon(qIndex/15);
    updateHud();}
  function renderButtons(q,type){q.options.forEach(opt=>{const b=document.createElement('button');b.type='button';b.className='answer-btn visual-btn '+(type||'cloud');b.textContent=opt;b.addEventListener('click',()=>answer(b,opt,q.answer));els.zone.appendChild(b);});}
  function renderLine(q){const wrap=document.createElement('div');wrap.className='number-line';q.options.forEach(opt=>{const b=document.createElement('button');b.type='button';b.className='line-choice';b.innerHTML=`<span>${opt}</span>`;b.addEventListener('click',()=>answer(b,opt,q.answer));wrap.appendChild(b);});els.zone.appendChild(wrap);}
  function renderClock(q){q.options.forEach(opt=>{const [h,m]=opt.split(':').map(Number);const b=document.createElement('button');b.type='button';b.className='answer-btn clock-choice';const hourRot=((h%12)*30)+(m*.5);const minRot=m*6;b.innerHTML=`<div class="clock-face" style="--hourRot:${hourRot}deg;--minRot:${minRot}deg"></div><span>${opt}</span>`;b.addEventListener('click',()=>answer(b,opt,q.answer,q.answers));els.zone.appendChild(b);});}
  function renderInput(q){
    const wrap=document.createElement('div');wrap.className='input-challenge';
    const helper=document.createElement('div');helper.className='input-helper';helper.textContent=q.helper||'Type your answer, then launch it.';
    const input=document.createElement('input');input.type='text';input.inputMode=q.inputMode||'text';input.autocomplete='off';input.placeholder=q.placeholder||'Type answer';input.setAttribute('aria-label','Answer');
    const btn=document.createElement('button');btn.type='button';btn.className='primary-btn';btn.textContent='LAUNCH ANSWER';
    const submit=()=>answer(btn,input.value,q.answer,q.answers,input);
    btn.addEventListener('click',submit);input.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
    wrap.append(helper,input,btn);els.zone.appendChild(wrap);setTimeout(()=>input.focus(),60);
  }
  function clean(v){return String(v).toLowerCase().replace(/,/g,'').replace(/\s+/g,'').replace(/×/g,'x');}
  function isCorrect(opt,ans,answers){const c=clean(opt);return (answers||[ans]).map(clean).includes(c);}
  function answer(btn,opt,ans,answers,input){if(locked)return;locked=true;if(isCorrect(opt,ans,answers)){btn.classList.add('correct');if(input)input.classList.add('correct');els.feedback.textContent='NICE FLIGHT';sound('correct');state.xp+=10;els.falcon.classList.add('boost');setTimeout(()=>els.falcon.classList.remove('boost'),450);qIndex++;positionFalcon(qIndex/15);updateHud();setTimeout(()=>{qIndex>=questions.length?completeMission():renderQuestion()},650);}else{btn.classList.add('wrong');if(input)input.classList.add('wrong');lives--;els.feedback.textContent=lives>0?'TRY ANOTHER PATH':'START THIS MISSION AGAIN';sound('wrong');updateHud();if(lives<=0){setTimeout(()=>startMission(current),950)}else{setTimeout(()=>{btn.classList.remove('wrong');if(input){input.classList.remove('wrong');input.value='';input.focus();}locked=false;els.feedback.textContent='';},850)}}}
  function completeMission(){state.complete=[...new Set([...state.complete,current])];saveBadge(missions[current].badge);if(current>=state.unlocked&&state.unlocked<missions.length-1)state.unlocked=current+1;state.xp+=50;save();renderMap();updateHud();els.completeTitle.textContent=missions[current].badge;els.completeLabel.textContent=current===missions.length-1?'FLIGHT SCHOOL COMPLETE':'BADGE EARNED';show('complete');sound('win');positionFalcon(1);if(current<missions.length-1){setTimeout(()=>startMission(current+1),1800)}}
  els.startBtn.addEventListener('click',()=>startMission(Math.min(state.unlocked,missions.length-1)));
  els.resetBtn.addEventListener('click',()=>{if(confirm('Reset Flight School progress?')){localStorage.removeItem(storeKey);localStorage.removeItem(badgeKey);state=load();boot();}});
  els.continueBtn.addEventListener('click',()=>{current<missions.length-1?startMission(current+1):boot();});
  boot();
})();
