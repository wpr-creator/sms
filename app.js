const MISSIONS = [
  {title:'MULTIPLICATION CANYON', short:'MULTIPLICATION', icon:'✖️', skill:'facts to 12', kind:'multiplication', scene:'canyon'},
  {title:'DIVISION CAVES', short:'DIVISION', icon:'➗', skill:'facts to 12', kind:'division', scene:'cave'},
  {title:'WORD PROBLEM WOODS', short:'ONE STEP WORDS', icon:'🌲', skill:'one step problems', kind:'oneStep', scene:'woods'},
  {title:'DOUBLE TROUBLE RIDGE', short:'TWO STEP WORDS', icon:'⛰️', skill:'two step problems', kind:'twoStep', scene:'ridge'},
  {title:'PLACE VALUE TOWERS', short:'PLACE VALUE', icon:'🏰', skill:'to 1,000', kind:'placeValue', scene:'tower'},
  {title:'ROUNDING RUNWAY', short:'ROUNDING', icon:'🛫', skill:'nearest 10 and 100', kind:'rounding', scene:'runway'},
  {title:'ADDITION AIRPORT', short:'ADDITION', icon:'➕', skill:'within 1,000', kind:'addition', scene:'airport'},
  {title:'SUBTRACTION SKYWAY', short:'SUBTRACTION', icon:'➖', skill:'within 1,000', kind:'subtraction', scene:'skyway'},
  {title:'MULTIPLE OF 10 MOUNTAIN', short:'TENS TIMES', icon:'🔟', skill:'multiply by tens', kind:'tens', scene:'mountain'},
  {title:'FRACTION LINE RIVER', short:'FRACTION LINE', icon:'〰️', skill:'fractions on a line', kind:'fractionLine', scene:'river'},
  {title:'FRACTION FACE OFF', short:'COMPARE FRACTIONS', icon:'⚔️', skill:'same top or bottom', kind:'compareFractions', scene:'arena'},
  {title:'WHOLE PIE HANGAR', short:'PARTS OF A WHOLE', icon:'🥧', skill:'fraction parts', kind:'partsWhole', scene:'hangar'},
  {title:'CLOCKTOWER DASH', short:'TIME', icon:'🕒', skill:'nearest minute', kind:'time', scene:'clock'},
  {title:'AREA ARENA', short:'AREA', icon:'🔲', skill:'count square units', kind:'area', scene:'area'},
  {title:'PERIMETER PATROL', short:'PERIMETER', icon:'📏', skill:'around the edge', kind:'perimeter', scene:'fence'},
  {title:'SHAPE SPLIT FINAL', short:'EQUAL PARTS', icon:'🔷', skill:'shapes and fractions', kind:'partition', scene:'final'}
];
const TOTAL_Q = 15;
const STORAGE_KEY = 'falconFlightSchoolV7';
let state = loadState();
let audioOn = true;
let currentLevel = 0, mission = null, questions = [], qIndex = 0, lives = 3, score = 0, selected = null, correctAnswer = null;

function loadState(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {unlocked:0, completed:[], xp:0, sound:true};}
  catch(e){return {unlocked:0, completed:[], xp:0, sound:true};}
}
function saveState(){localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}
function rank(){return state.xp>=1200?'ACE':state.xp>=700?'CAPTAIN':state.xp>=350?'WING LEADER':'ROOKIE';}
function $(id){return document.getElementById(id);}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(arr){return arr[rand(0,arr.length-1)];}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
function makeChoices(answer, min=0, max=200){let set=new Set([answer]); while(set.size<4){let off=pick([-12,-10,-5,-3,-2,-1,1,2,3,5,10,12]); let v=answer+off; if(v>=min && v<=max) set.add(v);} return shuffle([...set]);}

function sound(type){
  if(!audioOn) return;
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination); g.gain.value=.06;
  const now = ctx.currentTime;
  if(type==='good'){o.frequency.setValueAtTime(520,now); o.frequency.exponentialRampToValueAtTime(920,now+.18);} 
  else if(type==='bad'){o.frequency.setValueAtTime(190,now); o.frequency.exponentialRampToValueAtTime(90,now+.22);} 
  else {o.frequency.setValueAtTime(330,now); o.frequency.exponentialRampToValueAtTime(660,now+.28);}
  o.type = type==='bad'?'sawtooth':'triangle'; o.start(now); g.gain.exponentialRampToValueAtTime(.001,now+.3); o.stop(now+.32);
}

function setupCommon(){
  audioOn = state.sound !== false;
  const btn = $('soundBtn');
  if(btn){btn.textContent = audioOn ? 'SOUND: ON' : 'SOUND: OFF'; btn.onclick=()=>{audioOn=!audioOn; state.sound=audioOn; saveState(); btn.textContent=audioOn?'SOUND: ON':'SOUND: OFF'; sound('win');};}
}

function initHome(){
  setupCommon();
  $('rankPill').textContent = `RANK: ${rank()}`; $('xpPill').textContent = `XP: ${state.xp}`;
  const next = Math.min(state.unlocked || 0, MISSIONS.length-1);
  $('playBtn').href = `mission.html?level=${next}`; $('continueBtn').href = `mission.html?level=${next}`;
  const grid = $('missionGrid'); grid.innerHTML='';
  MISSIONS.forEach((m,i)=>{
    const card = document.createElement('a');
    const done = state.completed.includes(i);
    const locked = i > state.unlocked;
    card.className = `mission-card ${locked?'locked':''}`;
    card.href = locked ? '#' : `mission.html?level=${i}`;
    card.innerHTML = `<span class="status-chip">${done?'PASSED':locked?'LOCKED':'READY'}</span><div class="big-icon">${m.icon}</div><h3>MISSION ${i+1}: ${m.short}</h3><p>${locked?'Beat the mission before this one.':m.skill}</p>`;
    if(locked) card.addEventListener('click', e=>e.preventDefault());
    grid.appendChild(card);
  });
}

function initMission(){
  setupCommon();
  const params = new URLSearchParams(location.search);
  currentLevel = Math.max(0, Math.min(MISSIONS.length-1, parseInt(params.get('level')||'0',10)));
  if(currentLevel > state.unlocked){ location.href = `mission.html?level=${state.unlocked}`; return; }
  mission = MISSIONS[currentLevel]; qIndex=0; lives=3; score=0; selected=null;
  $('levelPill').textContent = `MISSION ${currentLevel+1}`; $('missionTag').textContent = `MISSION ${currentLevel+1}`; $('missionTitle').textContent = mission.title;
  $('sceneCard').innerHTML = sceneSvg(mission.scene);
  questions = buildBank(mission.kind).slice(0, TOTAL_Q);
  showQuestion();
}

function buildBank(kind){
  const bank=[];
  for(let i=0;i<70;i++) bank.push(makeQuestion(kind));
  const unique=[]; const seen=new Set();
  for(const q of shuffle(bank)){ const key=q.text+q.answer; if(!seen.has(key)){seen.add(key); unique.push(q);} }
  return unique.length>=TOTAL_Q?unique:bank;
}

function makeQuestion(kind){
  if(kind==='multiplication'){let a=rand(0,12),b=rand(0,12),ans=a*b; return simple(`${a} × ${b} = ?`, ans, makeChoices(ans,0,144), pick(['choice','input','falconPick']));}
  if(kind==='division'){let b=rand(1,12), ans=rand(0,12), total=b*ans; return simple(`${total} ÷ ${b} = ?`, ans, makeChoices(ans,0,12), pick(['choice','input','falconPick']));}
  if(kind==='oneStep'){let a=rand(8,45),b=rand(3,25),op=pick(['+','-','×']); if(op==='×'){a=rand(2,12);b=rand(2,12);} let ans=op==='+'?a+b:op==='-'?a-b:a*b; if(ans<0){[a,b]=[b,a];ans=a-b;} return simple(`A falcon collects ${a} feathers and then ${op==='+'?'finds':op==='-'?'drops':'fills'} ${b} ${op==='×'?'nests with that many feathers':'more feathers'}. How many?`, ans, makeChoices(ans,0,160), pick(['choice','input']));}
  if(kind==='twoStep'){let a=rand(10,40), b=rand(5,25), c=rand(2,12), ans=a+b-c; return simple(`The team has ${a} snacks. They get ${b} more. Then they eat ${c}. How many snacks are left?`, ans, makeChoices(ans,0,100), pick(['choice','input']));}
  if(kind==='placeValue'){let n=rand(100,999); let type=pick(['hundreds','tens','ones','expanded']); let ans= type==='hundreds'?Math.floor(n/100):type==='tens'?Math.floor(n/10)%10:type==='ones'?n%10:`${Math.floor(n/100)*100} + ${Math.floor(n/10)%10*10} + ${n%10}`; let choices= type==='expanded'?shuffle([ans,`${Math.floor(n/100)} + ${Math.floor(n/10)%10} + ${n%10}`,`${Math.floor(n/100)*10} + ${Math.floor(n/10)%10*10} + ${n%10}`,`${Math.floor(n/100)*100} + ${Math.floor(n/10)%10} + ${n%10}`]):makeChoices(ans,0,9); return simple(type==='expanded'?`Choose the expanded form of ${n}.`:`In ${n}, what digit is in the ${type} place?`, ans, choices, 'choice');}
  if(kind==='rounding'){let n=rand(101,999), place=pick([10,100]), ans=Math.round(n/place)*place; return simple(`Round ${n} to the nearest ${place}.`, ans, makeChoices(ans,0,1000), pick(['choice','input','falconPick']));}
  if(kind==='addition'){let a=rand(100,899),b=rand(50,999-a),ans=a+b; return simple(`${a} + ${b} = ?`, ans, makeChoices(ans,0,1000), pick(['choice','input']));}
  if(kind==='subtraction'){let a=rand(250,999),b=rand(50,a-1),ans=a-b; return simple(`${a} - ${b} = ?`, ans, makeChoices(ans,0,1000), pick(['choice','input']));}
  if(kind==='tens'){let a=rand(2,9)*10,b=rand(2,12),ans=a*b; return simple(`${a} × ${b} = ?`, ans, makeChoices(ans,0,1200), pick(['choice','input','falconPick']));}
  if(kind==='fractionLine'){let den=pick([2,3,4,6,8]), num=rand(1,den-1); return {type:'choice', text:`The falcon lands at ${num}/${den} on the number line. Which fraction matches?`, answer:`${num}/${den}`, choices:shuffle([`${num}/${den}`,`${den-num}/${den}`,`${num}/${den+1}`,`${Math.min(num+1,den)}/${den}`]), visual:numberLine(num,den)};}
  if(kind==='compareFractions'){let same=pick(['den','num']); let den1=pick([3,4,5,6,8]), den2=pick([3,4,5,6,8]); let num1=rand(1,Math.min(den1-1,5)), num2=rand(1,Math.min(den2-1,5)); if(same==='den'){den2=den1; num2= num1===1?2:num1-1;} else {num2=num1; den2= den1===3?6:den1-1;} let f1=num1/den1, f2=num2/den2; let ans=f1>f2?`${num1}/${den1}`:`${num2}/${den2}`; return {type:'choice', text:`Which fraction is greater?`, answer:ans, choices:shuffle([`${num1}/${den1}`,`${num2}/${den2}`]), visual:fractionCompare(num1,den1,num2,den2)};}
  if(kind==='partsWhole'){let den=pick([2,3,4,6,8]), num=rand(1,den); return {type:'choice', text:`What fraction of the strip is shaded?`, answer:`${num}/${den}`, choices:shuffle([`${num}/${den}`,`${den-num||1}/${den}`,`${num}/${den+1}`,`${Math.min(num+1,den)}/${den}`]), visual:fractionStrip(num,den)};}
  if(kind==='time'){let h=rand(1,12), m=rand(0,59), mm=String(m).padStart(2,'0'), ans=`${h}:${mm}`; return {type:'choice', text:`What time is on the clock?`, answer:ans, choices:shuffle([ans,`${h}:${String((m+5)%60).padStart(2,'0')}`,`${h===12?1:h+1}:${mm}`,`${h}:${String(Math.abs(m-10)).padStart(2,'0')}`]), visual:clockSvg(h,m)};}
  if(kind==='area'){let w=rand(2,6),h=rand(2,5),ans=w*h; return {type:pick(['choice','input']), text:`What is the area of this floor?`, answer:ans, choices:makeChoices(ans,0,36), visual:gridSvg(w,h,true)};}
  if(kind==='perimeter'){let w=rand(3,12),h=rand(2,9),ans=2*(w+h); return simple(`A field is ${w} units long and ${h} units wide. What is the perimeter?`, ans, makeChoices(ans,0,50), pick(['choice','input']));}
  let den=pick([2,3,4,6]), num=rand(1,den); return {type:'choice', text:`This shape has ${den} equal parts. ${num} are shaded. What fraction is shaded?`, answer:`${num}/${den}`, choices:shuffle([`${num}/${den}`,`${den}/${num}`,`${num}/${den+1}`,`${Math.max(1,num-1)}/${den}`]), visual:fractionStrip(num,den)};
}
function simple(text, answer, choices, type){return {type,text,answer,choices,visual:''};}

function showQuestion(){
  const q=questions[qIndex]; selected=null; correctAnswer=q.answer;
  $('progressPill').textContent = `${qIndex+1} / ${TOTAL_Q}`; $('livesPill').textContent = `LIVES: ${'❤'.repeat(lives)}${'♡'.repeat(3-lives)}`;
  $('questionText').textContent = q.text; $('promptType').textContent = labelFor(q.type); $('visualArea').innerHTML = q.visual || miniFalconScene(); $('feedback').textContent=''; $('feedback').className='feedback'; $('checkBtn').classList.remove('hidden'); $('nextBtn').classList.add('hidden');
  updateFlight(); renderAnswer(q);
}
function labelFor(t){return t==='input'?'TYPE IT':t==='falconPick'?'PICK A PERCH':t==='order'?'BUILD IT':'CHOOSE';}
function renderAnswer(q){
  const area=$('answerArea'); area.innerHTML='';
  if(q.type==='input') area.innerHTML = `<input id="numberInput" class="number-input" inputmode="numeric" aria-label="Type your answer" placeholder="TYPE ANSWER">`;
  else {
    const grid=document.createElement('div'); grid.className='choice-grid';
    q.choices.forEach(c=>{const b=document.createElement('button'); b.type='button'; b.className=q.type==='falconPick'?'choice perch':'choice'; b.innerHTML = q.type==='falconPick'?`🪨 ${c}`:c; b.onclick=()=>{document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selected=c;}; grid.appendChild(b);});
    area.appendChild(grid);
  }
}
function checkAnswer(){
  const q=questions[qIndex]; let ans = q.type==='input' ? $('numberInput').value.trim() : selected;
  if(ans===null || ans===''){ $('feedback').textContent='Pick or type an answer first.'; $('feedback').className='feedback bad'; return; }
  const ok = String(ans).toLowerCase() === String(q.answer).toLowerCase();
  if(ok){ score++; sound('good'); $('feedback').textContent = pick(['Nice flight!','You cleared it!','Falcon power!','Correct! Keep flying.']); $('feedback').className='feedback good'; $('checkBtn').classList.add('hidden'); $('nextBtn').classList.remove('hidden'); }
  else { lives--; sound('bad'); $('livesPill').textContent = `LIVES: ${'❤'.repeat(lives)}${'♡'.repeat(3-lives)}`; $('feedback').textContent = `Not yet. The answer was ${q.answer}.`; $('feedback').className='feedback bad'; $('checkBtn').classList.add('hidden'); $('nextBtn').classList.remove('hidden'); if(lives<=0) setTimeout(gameOver,650); }
}
function nextQuestion(){ qIndex++; if(qIndex>=TOTAL_Q) completeMission(); else showQuestion(); }
function updateFlight(){const pct=Math.round((qIndex/TOTAL_Q)*100); $('flightFill').style.width=pct+'%'; $('falconMarker').style.left=`calc(${pct}% - 12px)`;}
function completeMission(){
  sound('win'); if(!state.completed.includes(currentLevel)) state.completed.push(currentLevel); state.unlocked=Math.max(state.unlocked,currentLevel+1); state.xp += 50 + lives*25 + score*5; saveState();
  const next=currentLevel+1; const final=next>=MISSIONS.length;
  showModal('MISSION COMPLETE', final?'You finished Falcon Flight School!':`You beat the ${mission.short} mission. Next flight is ready.`, final?`<a class="game-btn primary" href="index.html">BACK TO BASE</a>`:`<a class="game-btn primary" href="mission.html?level=${next}">START NEXT MISSION</a><a class="game-btn" href="index.html">BASE MAP</a>`);
}
function gameOver(){ showModal('TRY AGAIN', 'Your falcon ran out of lives. Restart this mission and fly it again.', `<a class="game-btn primary" href="mission.html?level=${currentLevel}">RESTART MISSION</a><a class="game-btn" href="index.html">BASE MAP</a>`); }
function showModal(title,text,buttons){$('modalTitle').textContent=title; $('modalText').textContent=text; $('modalButtons').innerHTML=buttons; $('modal').classList.remove('hidden');}

function miniFalconScene(){return `<svg viewBox="0 0 600 150" aria-hidden="true"><path d="M0 110 C80 55 160 135 240 70 S390 10 600 85" fill="none" stroke="#5eead4" stroke-width="8" opacity=".55"/><text x="60" y="80" font-size="58">🦅</text><circle cx="250" cy="74" r="18" fill="#ffd166"/><circle cx="430" cy="48" r="18" fill="#ffd166"/></svg>`;}
function sceneSvg(scene){
  const base = {canyon:'#a8552b',cave:'#334155',woods:'#166534',ridge:'#4b5563',tower:'#64748b',runway:'#475569',airport:'#2563eb',skyway:'#0ea5e9',mountain:'#57534e',river:'#0284c7',arena:'#7c2d12',hangar:'#334155',clock:'#581c87',area:'#365314',fence:'#78350f',final:'#0f766e'}[scene] || '#1e3a5f';
  return `<svg viewBox="0 0 320 230" preserveAspectRatio="xMidYMid slice"><rect width="320" height="230" fill="#07182d"/><circle cx="265" cy="42" r="28" fill="#ffd166" opacity=".9"/><path d="M0 165 C70 95 120 210 190 120 S280 90 340 145 V230 H0 Z" fill="${base}"/><path d="M0 190 C80 140 130 225 220 155 S290 135 340 175 V230 H0 Z" fill="#0f2747" opacity=".9"/><path d="M30 70 C80 32 125 96 175 55 S260 36 306 78" fill="none" stroke="#5eead4" stroke-width="5" opacity=".5"/><text x="42" y="92" font-size="54">🦅</text><g opacity=".95"><circle cx="250" cy="134" r="20" fill="#ffd166"/><text x="250" y="143" text-anchor="middle" font-size="22" font-weight="800" fill="#111827">★</text></g></svg>`;
}
function numberLine(num,den){let ticks=''; for(let i=0;i<=den;i++){let x=50+i*(500/den); ticks+=`<line x1="${x}" y1="82" x2="${x}" y2="112" stroke="#dbeafe" stroke-width="4"/><text x="${x}" y="137" text-anchor="middle" fill="#dbeafe" font-size="18">${i}/${den}</text>`;} let px=50+num*(500/den); return `<svg viewBox="0 0 600 160"><line x1="50" y1="96" x2="550" y2="96" stroke="#dbeafe" stroke-width="6"/>${ticks}<text x="${px-20}" y="65" font-size="48">🦅</text></svg>`;}
function fractionStrip(num,den){let parts=''; for(let i=1;i<=den;i++) parts += `<div class="fraction-part ${i<=num?'on':''}"></div>`; return `<div class="fraction-strip">${parts}</div>`;}
function fractionCompare(a,b,c,d){return `<div>${fractionStrip(a,b)}<div style="height:12px"></div>${fractionStrip(c,d)}</div>`;}
function clockSvg(h,m){let minuteDeg=m*6-90, hourDeg=((h%12)*30 + m*.5)-90; return `<div class="clock-face"><div class="hand hour" style="transform:rotate(${hourDeg}deg)"></div><div class="hand minute" style="transform:rotate(${minuteDeg}deg)"></div><span style="transform:translate(-50%,-90px)">12</span><span style="transform:translate(76px,-50%)">3</span><span style="transform:translate(-50%,66px)">6</span><span style="transform:translate(-90px,-50%)">9</span></div>`;}
function gridSvg(w,h,on){let cells=''; for(let i=0;i<w*h;i++) cells+=`<div class="cell ${on?'on':''}"></div>`; return `<div class="shape-grid" style="grid-template-columns:repeat(${w},36px)">${cells}</div>`;}

document.addEventListener('DOMContentLoaded',()=>{
  if(document.body.classList.contains('page-home')) initHome();
  if(document.body.classList.contains('page-mission')) { initMission(); $('checkBtn').onclick=checkAnswer; $('nextBtn').onclick=nextQuestion; document.addEventListener('keydown', e=>{if(e.key==='Enter'){ if(!$('checkBtn').classList.contains('hidden')) checkAnswer(); else nextQuestion(); }}); }
});
