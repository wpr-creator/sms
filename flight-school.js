const missions=[
 {name:'MULTIPLICATION CANYON',scene:'desert',skill:'multiplication',hint:'Fly through the canyon. Pick the right products.',badge:'CANYON PILOT',props:['cloud1.png','cloud2.png','cloud3.png','sun.png']},
 {name:'DIVISION NEST',scene:'forest',skill:'division',hint:'Land near the nest with the right quotient.',badge:'NEST NAVIGATOR',props:['tree01.png','tree02.png','tree03.png','tree04.png','tree05.png']},
 {name:'PLACE VALUE PEAKS',scene:'castle',skill:'placeValue',hint:'Build numbers with hundreds, tens, and ones.',badge:'PEAK CLIMBER',props:['tower_beige.png','castle_beige.png','tree01.png']},
 {name:'ROUNDING RAPIDS',scene:'grass',skill:'rounding',hint:'Jump to the nearest safe perch.',badge:'RAPID RIDER',props:['fence.png','fence_piece.png','tree02.png','tree03.png']},
 {name:'FRACTION FOREST',scene:'fall',skill:'fractions',hint:'Follow the fraction trail.',badge:'FOREST SCOUT',props:['tree04.png','tree05.png','tree01.png']},
 {name:'TIME TOWER',scene:'castle',skill:'time',hint:'Match the time before the clock tower rings.',badge:'TIME KEEPER',props:['tower_beige.png','castle_beige.png','cloud1.png']},
 {name:'AREA OUTPOST',scene:'grass',skill:'area',hint:'Cover the ground with the right number of tiles.',badge:'TILE CAPTAIN',props:['fence.png','tree03.png','tree04.png']},
 {name:'PERIMETER RIDGE',scene:'desert',skill:'perimeter',hint:'Trace the outside path.',badge:'RIDGE RANGER',props:['fence_piece.png','cloud2.png','sun.png']}
];
let mission=0,q=0,lives=3,deck=[],current=null;const perMission=15;
const $=id=>document.getElementById(id);
const stage=$('stage'),falcon=$('falcon'),land=$('landscapeStrip'),title=$('missionTitle'),qHud=$('qHud'),lifeHud=$('lifeHud'),badgeHud=$('badgeHud'),start=$('startCard'),question=$('questionCard'),prompt=$('promptText'),choices=$('choices'),feedback=$('feedback'),boss=$('bossMarker');
function tone(freq=600,dur=.08,type='sine'){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.value=.06;osc.connect(gain);gain.connect(ctx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);osc.stop(ctx.currentTime+dur)}catch(e){}}
function badges(){return JSON.parse(localStorage.getItem('fsBadges')||'[]')}
function saveBadge(b){const s=new Set(badges());s.add(b);localStorage.setItem('fsBadges',JSON.stringify([...s]));badgeHud.textContent=s.size+' BADGES'}
function makeDeck(skill){let arr=[];for(let i=0;i<60;i++)arr.push(makeQuestion(skill,i));return arr.sort(()=>Math.random()-.5).slice(0,perMission)}
function makeQuestion(skill,i){ if(window.FS_BANK && FS_BANK[skill]) return FS_BANK[skill]();
 let a=2+Math.floor(Math.random()*11),b=2+Math.floor(Math.random()*11),ans=a*b,txt=`${a} × ${b} = ?`;
 if(skill==='division'){ans=a;txt=`${a*b} ÷ ${b} = ?`}
 if(skill==='placeValue'){let h=1+Math.floor(Math.random()*8),t=Math.floor(Math.random()*10),o=Math.floor(Math.random()*10);ans=h*100+t*10+o;txt=`${h} hundreds, ${t} tens, ${o} ones`}
 if(skill==='rounding'){let n=100+Math.floor(Math.random()*850);let by=Math.random()<.5?10:100;ans=Math.round(n/by)*by;txt=`Round ${n} to the nearest ${by}`}
 if(skill==='fractions'){let d=[2,3,4,6,8][Math.floor(Math.random()*5)],n=1+Math.floor(Math.random()*(d-1));ans=`${n}/${d}`;txt=`Which fraction shows ${n} of ${d} equal parts?`}
 if(skill==='time'){let hr=1+Math.floor(Math.random()*12),min=[0,5,10,15,20,25,30,35,40,45,50,55][Math.floor(Math.random()*12)];ans=`${hr}:${String(min).padStart(2,'0')}`;txt=`What time is ${hr} hours and ${min} minutes?`}
 if(skill==='area'){let w=2+Math.floor(Math.random()*8),h=2+Math.floor(Math.random()*8);ans=w*h;txt=`Area: ${w} rows of ${h}`}
 if(skill==='perimeter'){let w=2+Math.floor(Math.random()*9),h=2+Math.floor(Math.random()*9);ans=2*(w+h);txt=`Perimeter of ${w} by ${h}`}
 let opts=new Set([ans]);while(opts.size<4){let delta=Math.floor(Math.random()*12)-6;let v=typeof ans==='number'?Math.max(0,ans+delta):`${1+Math.floor(Math.random()*7)}/${2+Math.floor(Math.random()*7)}`;opts.add(v)}
 return {prompt:txt,answer:ans,options:[...opts].sort(()=>Math.random()-.5)}
}
function setupMission(){const m=missions[mission];title.textContent=m.name;stage.className='flight-stage '+m.scene;land.innerHTML='';[...m.props,...m.props,...m.props].forEach((p,i)=>{let img=document.createElement('img');img.src=p;img.className='prop '+(i%3===0?'small':'');land.appendChild(img)});$('missionHint').textContent=m.hint;deck=makeDeck(m.skill);q=0;lives=3;updateHud();start.classList.remove('hidden');question.classList.add('hidden');falcon.style.left='8%';boss.textContent='?'}
function updateHud(){qHud.textContent=`${q} / ${perMission}`;lifeHud.textContent='❤'.repeat(lives)+'♡'.repeat(3-lives);badgeHud.textContent=badges().length+' BADGES';let pct=8+(q/perMission)*72;falcon.style.left=pct+'%';boss.textContent=(q===4||q===9)?'BOSS':(q===14?'FINAL':'?')}
function showQuestion(){start.classList.add('hidden');question.classList.remove('hidden');current=deck[q];prompt.textContent=current.prompt;choices.innerHTML='';feedback.textContent='';current.options.forEach(opt=>{let b=document.createElement('button');b.className='choice';b.textContent=opt;b.onclick=()=>answer(opt,b);choices.appendChild(b)})}
function answer(opt,btn){[...choices.children].forEach(b=>b.disabled=true);if(String(opt)===String(current.answer)){btn.classList.add('correct');feedback.textContent=(q===4||q===9||q===14)?'BOSS HIT!':'GOOD FLIGHT!';tone(760,.1,'triangle');setTimeout(()=>tone(980,.12,'triangle'),70);falcon.classList.add('boost');q++;updateHud();setTimeout(()=>{falcon.classList.remove('boost'); if(q>=perMission)completeMission(); else showQuestion()},650)}else{btn.classList.add('wrong');feedback.textContent='TRY THE NEXT ONE.';tone(180,.16,'sawtooth');lives--;updateHud();setTimeout(()=>{ if(lives<=0){feedback.textContent='BACK TO THE START OF THIS MISSION.';setTimeout(setupMission,900)} else showQuestion()},800)}}
function completeMission(){saveBadge(missions[mission].badge);tone(880,.1,'triangle');setTimeout(()=>tone(1100,.16,'triangle'),100);mission++;if(mission>=missions.length){start.innerHTML='<h2>FLIGHT SCHOOL COMPLETE!</h2><p>All badges earned.</p><button onclick="location.href=\'index.html\'">BACK TO CAMP</button>';start.classList.remove('hidden');question.classList.add('hidden');return}setupMission();setTimeout(showQuestion,900)}
$('startBtn').onclick=showQuestion;setupMission();
