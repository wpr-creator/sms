const MISSIONS = [
  {id:'multiplication', name:'MULTIPLICATION CANYON', badge:'CANYON PILOT', type:'clouds', scene:'multiplication', boss:'STORM CLOUD', make: makeMultiplication},
  {id:'division', name:'DIVISION NEST', badge:'NEST NAVIGATOR', type:'nests', scene:'division', boss:'THE HUNGRY HAWK', make: makeDivision},
  {id:'place', name:'PLACE VALUE PEAKS', badge:'PEAK CLIMBER', type:'blocks', scene:'place', boss:'BLOCK GIANT', make: makePlaceValue},
  {id:'rounding', name:'ROUNDING RAPIDS', badge:'RAPID RIDER', type:'perches', scene:'rounding', boss:'RIVER RUSH', make: makeRounding},
  {id:'addition', name:'SUMMIT SUPPLY RUN', badge:'SUPPLY ACE', type:'clouds', scene:'place', boss:'SNOW SQUALL', make: makeAddition},
  {id:'subtraction', name:'CANYON RESCUE', badge:'RESCUE FLYER', type:'clouds', scene:'multiplication', boss:'DUST DEVIL', make: makeSubtraction},
  {id:'multiples10', name:'TENS TURBO RUN', badge:'TURBO TEN', type:'perches', scene:'rounding', boss:'TURBO TWISTER', make: makeMultiples10},
  {id:'fractionsLine', name:'FRACTION FOREST TRAIL', badge:'FOREST SCOUT', type:'line', scene:'fractions', boss:'MOSS MONSTER', make: makeFractionLine},
  {id:'fractionsCompare', name:'FRACTION LOOKOUT', badge:'FRACTION SPOTTER', type:'clouds', scene:'fractions', boss:'LOOKOUT LYNX', make: makeFractionCompare},
  {id:'partsWhole', name:'TREASURE PARTS COVE', badge:'PARTS PRO', type:'clouds', scene:'word', boss:'TREASURE CRAB', make: makePartsWhole},
  {id:'time', name:'TIME TOWER', badge:'TIME KEEPER', type:'clock', scene:'time', boss:'GEAR GOBLIN', make: makeTime},
  {id:'area', name:'AREA OUTPOST', badge:'TILE BUILDER', type:'tiles', scene:'area', boss:'FLOOR DRAGON', make: makeArea},
  {id:'perimeter', name:'PERIMETER RIDGE', badge:'FENCE MASTER', type:'perches', scene:'perimeter', boss:'RIDGE RAM', make: makePerimeter},
  {id:'partition', name:'EQUAL SHAPES HANGAR', badge:'SHAPE PILOT', type:'clouds', scene:'area', boss:'SHAPE SHIFTER', make: makePartition},
  {id:'word1', name:'WORD PROBLEM SKYWAY', badge:'STORY SOLVER', type:'clouds', scene:'word', boss:'RIDDLE ROOK', make: makeOneStepWord},
  {id:'word2', name:'TWO STEP SKY CHALLENGE', badge:'TWO STEP ACE', type:'clouds', scene:'word', boss:'FINAL WIND', make: makeTwoStepWord}
];
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function pick(arr){return arr[rand(0,arr.length-1)]}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function choices(answer, spread=12){const s=new Set([answer]);while(s.size<4){let v=answer+rand(-spread,spread); if(v>=0 && v!==answer)s.add(v)}return shuffle([...s])}
function q(prompt,answer,extra={}){return {prompt,answer,choices: choices(answer, Math.max(8, Math.ceil(answer*.25))),...extra}}
function makeMultiplication(){let a=rand(2,12),b=rand(2,12);return q(`${a} × ${b} = ?`,a*b,{visual:'clouds'});}
function makeDivision(){let b=rand(2,12),ans=rand(2,12),a=b*ans;return q(`${a} ÷ ${b} = ?`,ans,{visual:'nests'});}
function makePlaceValue(){let n=rand(100,999),h=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10;let prompts=[`What number has ${h} hundreds, ${t} tens, and ${o} ones?`,`What is the value of the ${pick(['hundreds','tens','ones'])} digit in ${n}?`];let p=prompts[0];return q(p,n,{hundreds:h,tens:t,ones:o,visual:'blocks'});}
function makeRounding(){let n=rand(11,999),place=pick([10,100]),ans=Math.round(n/place)*place;return q(`Round ${n} to the nearest ${place}.`,ans,{visual:'perches',choices:shuffle([ans, ans-place, ans+place, Math.max(0,ans+(Math.random()<.5?-2:2)*place)])});}
function makeAddition(){let a=rand(100,799),b=rand(80,1000-a);return q(`${a} + ${b} = ?`,a+b,{visual:'clouds'});}
function makeSubtraction(){let a=rand(200,999),b=rand(75,a-1);return q(`${a} - ${b} = ?`,a-b,{visual:'clouds'});}
function makeMultiples10(){let a=rand(2,9)*10,b=rand(2,9);return q(`${a} × ${b} = ?`,a*b,{visual:'perches'});}
function makeFractionLine(){let den=pick([2,3,4,6,8]),num=rand(1,den-1);return {prompt:`Find ${num}/${den} on the trail.`,answer:num/den,type:'line',num,den,choices:[0,1/den,2/den,3/den,4/den,5/den,6/den,7/den,1].filter(x=>x>=0&&x<=1)};}
function makeFractionCompare(){let den=pick([2,3,4,6,8,10]),a=rand(1,den-1),b=rand(1,den-1);while(b===a)b=rand(1,den-1);let ans=a>b?`${a}/${den}`:`${b}/${den}`;return {prompt:`Which fraction is greater?`,answer:ans,choices:shuffle([`${a}/${den}`,`${b}/${den}`]),compare:[`${a}/${den}`,`${b}/${den}`]};}
function makePartsWhole(){let den=pick([2,3,4,6,8]);let num=rand(1,den);return {prompt:`A shape is split into ${den} equal parts. ${num} parts are shaded. What fraction is shaded?`,answer:`${num}/${den}`,choices:shuffle([`${num}/${den}`,`${Math.max(1,num-1)}/${den}`,`${num}/${den+1}`,`${den-num}/${den}`])};}
function makeTime(){let hour=rand(1,12),min=pick([0,1,5,10,15,20,25,30,35,40,45,50,55]);let label=`${hour}:${String(min).padStart(2,'0')}`;return {prompt:`Choose the clock that shows ${label}.`,answer:label,choices:shuffle([label,`${hour}:${String((min+5)%60).padStart(2,'0')}`,`${hour===12?1:hour+1}:${String(min).padStart(2,'0')}`,`${hour}:${String(Math.max(0,min-5)).padStart(2,'0')}`]),hour,min,type:'clock'};}
function makeArea(){let l=rand(3,10),w=rand(2,8);return q(`A floor is ${l} by ${w}. What is the area?`,l*w,{rows:w,cols:l,visual:'tiles'});}
function makePerimeter(){let l=rand(3,12),w=rand(2,9);return q(`A pen is ${l} by ${w}. What is the perimeter?`,2*(l+w),{visual:'perches'});}
function makePartition(){let den=pick([2,3,4,6,8]);return {prompt:`A shape is split into ${den} equal parts. Each part is what fraction?`,answer:`1/${den}`,choices:shuffle([`1/${den}`,`${den}/1`,`1/${den+1}`,`2/${den}`])};}
const kids=['Mia','Jay','Luz','Sam','Ari','Noah'];
function makeOneStepWord(){let a=rand(2,12),b=rand(2,12),name=pick(kids);return q(`${name} packs ${a} bags with ${b} shells in each bag. How many shells?`,a*b,{visual:'clouds'});}
function makeTwoStepWord(){let a=rand(2,9),b=rand(2,9),c=rand(5,30),name=pick(kids);return q(`${name} has ${a} boxes with ${b} stickers in each box. Then ${name} gets ${c} more stickers. How many stickers now?`,a*b+c,{visual:'clouds'});}
