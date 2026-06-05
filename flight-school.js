const missions = [
  {name:'MULTIPLICATION CANYON', label:'CANYON RUN', scene:'desert', skill:'multiplication', hint:'Fly through the canyon. Pick the right products.', badge:'CANYON PILOT', props:['cloud1.png','cloud2.png','sun.png']},
  {name:'DIVISION NEST', label:'NEST LANDING', scene:'forest', skill:'division', hint:'Find the nest with the right quotient.', badge:'NEST NAVIGATOR', props:['tree01.png','tree02.png','tree03.png','tree04.png','tree05.png']},
  {name:'PLACE VALUE PEAKS', label:'PEAK CLIMB', scene:'castle', skill:'placeValue', hint:'Build the number from hundreds, tens, and ones.', badge:'PEAK CLIMBER', props:['tower_beige.png','castle_beige.png','tree01.png']},
  {name:'ROUNDING RAPIDS', label:'RAPID JUMP', scene:'rapids', skill:'rounding', hint:'Jump to the nearest safe perch.', badge:'RAPID RIDER', props:['fence.png','fence_piece.png','tree02.png','tree03.png']},
  {name:'FRACTION FOREST', label:'FOREST TRAIL', scene:'fall', skill:'fractions', hint:'Follow the fraction trail.', badge:'FOREST SCOUT', props:['tree04.png','tree05.png','tree01.png']},
  {name:'TIME TOWER', label:'CLOCK DASH', scene:'tower', skill:'time', hint:'Match the time before the tower rings.', badge:'TIME KEEPER', props:['tower_beige.png','castle_beige.png','cloud1.png']},
  {name:'AREA OUTPOST', label:'TILE FLIGHT', scene:'grass', skill:'area', hint:'Cover the ground with the right number of tiles.', badge:'TILE CAPTAIN', props:['fence.png','tree03.png','tree04.png']},
  {name:'PERIMETER RIDGE', label:'RIDGE RUN', scene:'ridge', skill:'perimeter', hint:'Trace the outside path.', badge:'RIDGE RANGER', props:['fence_piece.png','cloud2.png','sun.png']}
];

let mission = 0, q = 0, lives = 3, deck = [], current = null;
const perMission = 15;
const $ = id => document.getElementById(id);
const stage = $('stage'), falcon = $('falcon'), landmarks = $('landmarks'), ground = $('groundStrip');
const title = $('missionTitle'), qHud = $('qHud'), lifeHud = $('lifeHud'), badgeHud = $('badgeHud');
const startCard = $('startCard'), questionCard = $('questionCard'), promptText = $('promptText');
const choices = $('choices'), feedback = $('feedback'), boss = $('bossMarker'), stageLabel = $('stageLabel');

function tone(freq = 600, dur = .08, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = .06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function badges(){ return JSON.parse(localStorage.getItem('fsBadges') || '[]'); }
function saveBadge(b){ const s = new Set(badges()); s.add(b); localStorage.setItem('fsBadges', JSON.stringify([...s])); badgeHud.textContent = s.size + ' BADGES'; }
function makeDeck(skill){ const arr = []; for(let i=0;i<90;i++) arr.push(makeQuestion(skill)); return arr.sort(()=>Math.random()-.5).slice(0,perMission); }
function makeQuestion(skill){ if(window.FS_BANK && FS_BANK[skill]) return FS_BANK[skill](); return {prompt:'6 × 4 = ?', answer:24, options:[24,20,28,18]}; }

function setLandmarks(m){
  landmarks.innerHTML = '';
  ground.innerHTML = '';
  const propSet = [...m.props, ...m.props, ...m.props, ...m.props];
  propSet.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = p;
    img.alt = '';
    img.className = 'landmark ' + (i % 4 === 0 ? 'large' : i % 3 === 0 ? 'small' : '');
    img.style.left = (8 + i * 14) + '%';
    img.style.bottom = (i % 2 === 0 ? 8 : 22) + 'px';
    landmarks.appendChild(img);
  });
  for(let i=0;i<18;i++){
    const tile = document.createElement('span');
    tile.className = 'ground-tile';
    ground.appendChild(tile);
  }
}
function setupMission(){
  const m = missions[mission];
  title.textContent = m.name;
  stage.className = 'flight-stage ' + m.scene;
  stageLabel.textContent = m.label;
  $('missionHint').textContent = m.hint;
  setLandmarks(m);
  deck = makeDeck(m.skill);
  q = 0; lives = 3;
  startCard.classList.remove('hidden');
  questionCard.classList.add('hidden');
  falcon.style.left = '7%';
  updateHud();
}
function updateHud(){
  qHud.textContent = `${q} / ${perMission}`;
  lifeHud.textContent = '❤'.repeat(lives) + '♡'.repeat(3-lives);
  badgeHud.textContent = badges().length + ' BADGES';
  falcon.style.left = (7 + (q / perMission) * 74) + '%';
  boss.textContent = (q === 4 || q === 9) ? 'BOSS' : (q === 14 ? 'FINAL' : '?');
}
function showQuestion(){
  startCard.classList.add('hidden');
  questionCard.classList.remove('hidden');
  current = deck[q];
  promptText.textContent = current.prompt;
  feedback.textContent = '';
  choices.innerHTML = '';
  current.options.forEach(opt => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.textContent = opt;
    button.addEventListener('click', () => answer(opt, button));
    choices.appendChild(button);
  });
}
function answer(opt, btn){
  [...choices.children].forEach(b => b.disabled = true);
  if(String(opt) === String(current.answer)){
    btn.classList.add('correct');
    feedback.textContent = (q === 4 || q === 9 || q === 14) ? 'BOSS HIT!' : 'GOOD FLIGHT!';
    tone(760,.1,'triangle'); setTimeout(()=>tone(980,.12,'triangle'),70);
    falcon.classList.add('boost');
    q++;
    updateHud();
    setTimeout(() => { falcon.classList.remove('boost'); q >= perMission ? completeMission() : showQuestion(); }, 700);
  } else {
    btn.classList.add('wrong');
    feedback.textContent = 'TRY THE NEXT ONE.';
    tone(180,.16,'sawtooth');
    lives--;
    updateHud();
    setTimeout(() => { lives <= 0 ? setupMission() : showQuestion(); }, 900);
  }
}
function completeMission(){
  saveBadge(missions[mission].badge);
  tone(880,.1,'triangle'); setTimeout(()=>tone(1100,.16,'triangle'),100);
  mission++;
  if(mission >= missions.length){
    startCard.innerHTML = '<h2>FLIGHT SCHOOL COMPLETE!</h2><p>ALL BADGES EARNED.</p><button type="button" onclick="location.href=\'index.html\'">BACK TO CAMP</button>';
    startCard.classList.remove('hidden');
    questionCard.classList.add('hidden');
    return;
  }
  setupMission();
  setTimeout(showQuestion, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  $('startBtn').addEventListener('click', showQuestion);
  setupMission();
});
