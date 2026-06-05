(function(){
  const TOTAL_PER_MISSION = 15;
  let missionIndex = 0, qNum = 0, lives = 3, xp = 0, current, lock=false;
  const $ = id => document.getElementById(id);
  const scene=$('scene'), sceneAssets=$('sceneAssets'), falcon=$('falcon'), activity=$('activity'), prompt=$('prompt'), feedback=$('feedback'), overlay=$('overlay');

  const assetScenes = {
    multiplication: ['sun.png','cloud1.png','cloud2.png','cloud3.png','tower_beige.png'],
    division: ['cloud1.png','tree01.png','tree02.png','tree03.png','tree04.png','tree05.png'],
    place: ['cloud1.png','cloud2.png','tower_beige.png','castle_beige.png'],
    rounding: ['cloud1.png','cloud3.png','fence.png','fence_piece.png','tree01.png'],
    fractions: ['cloud2.png','tree01.png','tree02.png','tree03.png','tree04.png','tree05.png'],
    word: ['sun.png','cloud1.png','cloud2.png','cloud3.png','tree01.png','castle_beige.png'],
    time: ['sun.png','cloud1.png','cloud2.png','tower_beige.png'],
    area: ['cloud1.png','cloud2.png','fence.png','fence_piece.png','castle_beige.png'],
    perimeter: ['cloud1.png','cloud3.png','fence.png','fence_piece.png','tree02.png']
  };

  const backgroundClass = s => {
    if(s==='multiplication') return 'desert-bg';
    if(s==='division') return 'forest-bg';
    if(s==='place') return 'castle-bg';
    if(s==='rounding') return 'grass-bg';
    if(s==='fractions') return 'fall-bg';
    if(s==='time') return 'castle-bg';
    if(s==='area') return 'grass-bg';
    if(s==='perimeter') return 'desert-bg';
    return 'grass-bg';
  };

  function audio(freq=520,dur=.08,type='sine'){
    try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.type=type;o.frequency.value=freq;o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.start();o.stop(ctx.currentTime+dur+.02)}catch(e){}
  }

  function saveBadge(badge){
    const prog=JSON.parse(localStorage.getItem('flightSchoolProgress')||'{}');
    prog.badges=[...new Set([...(prog.badges||[]),badge])];
    prog.xp=xp;
    prog.missionIndex=Math.max(prog.missionIndex||0,missionIndex+1);
    localStorage.setItem('flightSchoolProgress',JSON.stringify(prog));
    return prog;
  }

  function buildScene(sceneName){
    const m=MISSIONS[missionIndex];
    scene.className=`scene ${sceneName} ${backgroundClass(sceneName)}`;
    sceneAssets.innerHTML='';
    const list = assetScenes[sceneName] || assetScenes.word;
    list.forEach((src,i)=>{
      const img=document.createElement('img');
      img.src=src;
      img.alt='';
      img.className=`scene-prop prop-${i%6}`;
      img.style.setProperty('--delay', `${i * -1.8}s`);
      img.style.setProperty('--speed', `${14 + (i%4)*4}s`);
      sceneAssets.appendChild(img);
    });
    scene.setAttribute('data-zone', m.name);
  }

  function setHud(){
    const m=MISSIONS[missionIndex];
    $('missionPill').textContent=`MISSION ${missionIndex+1} / ${MISSIONS.length}`;
    $('livesPill').textContent='♥ '.repeat(lives).trim();
    $('xpPill').textContent=`XP ${xp}`;
    $('missionTitle').textContent=m.name;
    $('distanceBadge').textContent=`${Math.min(qNum+1,TOTAL_PER_MISSION)} / ${TOTAL_PER_MISSION}`;
    $('progressFill').style.width=`${(qNum/TOTAL_PER_MISSION)*100}%`;
    const x = Math.min(68, qNum/TOTAL_PER_MISSION*68);
    falcon.style.transform=`translateX(${x}vw)`;
  }

  function startMission(){
    lives=3;qNum=0;feedback.textContent='';overlay.classList.remove('show');
    buildScene(MISSIONS[missionIndex].scene);
    setHud();
    nextQuestion();
  }

  function nextQuestion(){
    lock=false;
    const m=MISSIONS[missionIndex];
    buildScene(m.scene);
    current=m.make();
    current.type=current.type||m.type;
    const boss = qNum===4 || qNum===9 || qNum===14;
    $('playCard').classList.toggle('boss',boss);
    $('bossTag').textContent = boss ? (qNum===14?`FINAL BOSS`:'BOSS') : '';
    prompt.textContent = boss ? `${m.boss}: ${current.prompt}` : current.prompt;
    render(current,m,boss);
    setHud();
  }

  function render(q,m,boss){
    activity.innerHTML='';
    if(q.type==='line'||m.type==='line') return renderLine(q);
    if(q.type==='clock'||m.type==='clock') return renderClock(q);
    if(m.type==='blocks') return renderBlocks(q);
    if(m.type==='tiles') return renderTiles(q);
    if(m.type==='perches'||m.type==='nests') return renderPerches(q,m.type);
    return renderChoices(q,m.type==='clouds');
  }

  function renderChoices(q,clouds=false){
    const wrap=document.createElement('div');wrap.className='choices '+(clouds?'cloud-choices':'');
    (q.choices||[]).forEach(c=>wrap.appendChild(btn(c,()=>answer(c))));activity.appendChild(wrap);
  }

  function renderPerches(q,type){
    const wrap=document.createElement('div');wrap.className='perch-choices '+(type==='nests'?'nest-choices':'');
    q.choices.forEach(c=>{const b=document.createElement('button');b.className='perch';b.textContent=c;b.onclick=()=>answer(c);wrap.appendChild(b)});
    activity.appendChild(wrap);
  }

  function renderBlocks(q){
    const wrap=document.createElement('div');wrap.className='block-builder';
    for(let i=0;i<(q.hundreds||0);i++)wrap.appendChild(block('100','hundred'));
    for(let i=0;i<(q.tens||0);i++)wrap.appendChild(block('10','ten'));
    for(let i=0;i<(q.ones||0);i++)wrap.appendChild(block('1','one'));
    const choices=document.createElement('div');choices.className='choices';q.choices.forEach(c=>choices.appendChild(btn(c,()=>answer(c))));
    activity.append(wrap,choices);
  }

  function renderTiles(q){
    const grid=document.createElement('div');grid.className='tile-grid';grid.style.gridTemplateColumns=`repeat(${Math.min(q.cols||4,10)},34px)`;
    for(let i=0;i<Math.min((q.rows||3)*(q.cols||4),80);i++){const t=document.createElement('div');t.className='tile';grid.appendChild(t)}
    const choices=document.createElement('div');choices.className='choices';q.choices.forEach(c=>choices.appendChild(btn(c,()=>answer(c))));activity.append(grid,choices);
  }

  function renderLine(q){
    const wrap=document.createElement('div');wrap.className='number-line';const track=document.createElement('div');track.className='line-track';
    for(let i=0;i<=q.den;i++){const tick=document.createElement('div');tick.className='tick';tick.style.left=`${i/q.den*100}%`;const b=document.createElement('button');b.textContent=i===0?'0':i===q.den?'1':`${i}/${q.den}`;b.onclick=()=>answer(i/q.den);tick.appendChild(b);track.appendChild(tick)}
    wrap.appendChild(track);activity.appendChild(wrap);
  }

  function renderClock(q){
    const wrap=document.createElement('div');wrap.className='choices clock-choices';q.choices.forEach(label=>{const card=document.createElement('button');card.className='choice clock-choice';card.innerHTML=clockSvg(label);card.onclick=()=>answer(label);wrap.appendChild(card)});activity.appendChild(wrap);
  }

  function clockSvg(label){const [h,m]=label.split(':').map(Number);const minAng=m*6-90;const hourAng=(h%12)*30+m*.5-90;return `<div class="clock-face"><span class="hand minute" style="transform:rotate(${minAng}deg)"></span><span class="hand hour" style="transform:rotate(${hourAng}deg)"></span></div>`;}
  function block(txt,cls){const d=document.createElement('div');d.className='block '+cls;d.textContent=txt;return d;}
  function btn(text,fn){const b=document.createElement('button');b.className='choice';b.textContent=text;b.onclick=fn;return b;}

  function answer(value){
    if(lock)return;lock=true;
    const ok = String(value)===String(current.answer) || Math.abs(Number(value)-Number(current.answer))<0.001;
    [...activity.querySelectorAll('button')].forEach(b=>{if(String(b.textContent).trim()===String(current.answer))b.classList.add('correct')});
    if(ok){
      audio(660,.07,'triangle');setTimeout(()=>audio(920,.08,'triangle'),70);xp+=10;
      feedback.textContent = qNum===14 ? 'MISSION CLEAR!' : 'NICE FLIGHT!';
      falcon.classList.remove('hit');falcon.classList.add('boost');scene.classList.add('success-pulse');
      qNum++;setHud();
      setTimeout(()=>{falcon.classList.remove('boost');scene.classList.remove('success-pulse')},520);
      setTimeout(()=>{qNum>=TOTAL_PER_MISSION?completeMission():nextQuestion()},780);
    }else{
      audio(150,.16,'sawtooth');lives--;feedback.textContent='TRY AGAIN';falcon.classList.add('hit');setHud();
      setTimeout(()=>falcon.classList.remove('hit'),420);
      setTimeout(()=>{if(lives<=0)restartMission();else lock=false;feedback.textContent=''},800);
    }
  }

  function completeMission(){
    const prog=saveBadge(MISSIONS[missionIndex].badge);
    audio(720,.1,'triangle');setTimeout(()=>audio(960,.12,'triangle'),110);setTimeout(()=>audio(1200,.15,'triangle'),240);
    overlay.classList.add('show');
    overlay.querySelector('.modal').innerHTML=`<h2>${MISSIONS[missionIndex].badge}</h2><p>BADGE EARNED</p><div class="badge-wall">${prog.badges.map(b=>`<span class="badge">${b}</span>`).join('')}</div><button id="nextMission">KEEP FLYING</button><a href="index.html">CAMP</a>`;
    document.getElementById('nextMission').onclick=()=>{missionIndex++; if(missionIndex>=MISSIONS.length){finishGame()} else startMission();};
  }

  function restartMission(){
    overlay.classList.add('show');
    overlay.querySelector('.modal').innerHTML=`<h2>MISSION RESET</h2><p>TRY THE ZONE AGAIN.</p><button id="retryMission">RETRY</button><a href="index.html">CAMP</a>`;
    document.getElementById('retryMission').onclick=startMission;
  }

  function finishGame(){overlay.classList.add('show');overlay.querySelector('.modal').innerHTML=`<h2>SKY CHAMPION</h2><p>YOU CLEARED FLIGHT SCHOOL.</p><a href="index.html">BACK TO CAMP</a>`;}
  document.getElementById('startBtn').onclick=()=>{audio(520,.08,'triangle');startMission();};
})();
