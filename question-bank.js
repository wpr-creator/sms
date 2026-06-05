window.FLIGHT_BANK = [
  {id:'mult',title:'MULTIPLICATION CANYON',skill:'Multiplication facts to 12',mode:'choice',count:15,bank:makeFacts('×')},
  {id:'div',title:'DIVISION NEST',skill:'Division facts to 12',mode:'choice',count:15,bank:makeFacts('÷')},
  {id:'one',title:'ONE STEP TRAIL',skill:'One step word problems',mode:'choice',count:15,bank:wordOne()},
  {id:'two',title:'TWO STEP RIDGE',skill:'Two step word problems',mode:'choice',count:15,bank:wordTwo()},
  {id:'pv',title:'PLACE VALUE PEAKS',skill:'Place value to 1,000',mode:'choice',count:15,bank:placeValue()},
  {id:'round',title:'ROUNDING RAPIDS',skill:'Rounding to nearest 10 and 100',mode:'choice',count:15,bank:rounding()},
  {id:'add',title:'ADDITION AIRWAY',skill:'Adding within 1,000',mode:'input',count:15,bank:addSub('+')},
  {id:'sub',title:'SUBTRACTION SKYWAY',skill:'Subtracting within 1,000',mode:'input',count:15,bank:addSub('-')},
  {id:'tens',title:'TENS TAKEOFF',skill:'Multiplying by multiples of 10',mode:'choice',count:15,bank:multiples10()},
  {id:'line',title:'FRACTION RUNWAY',skill:'Fractions on a number line',mode:'choice',count:15,bank:fractionLine()},
  {id:'compare',title:'FRACTION FACE OFF',skill:'Compare fractions',mode:'choice',count:15,bank:compareFractions()},
  {id:'whole',title:'PARTS OF A WHOLE',skill:'Parts of a whole',mode:'choice',count:15,bank:partsWhole()},
  {id:'time',title:'TIME TOWER',skill:'Telling time to the nearest minute',mode:'choice',count:15,bank:timeBank()},
  {id:'area',title:'AREA ARENA',skill:'Area',mode:'input',count:15,bank:areaBank()},
  {id:'perim',title:'PERIMETER PATH',skill:'Perimeter',mode:'input',count:15,bank:perimeterBank()},
  {id:'partition',title:'SHAPE SPLIT COVE',skill:'Equal areas and fractions',mode:'choice',count:15,bank:partitionBank()}
];
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function q(prompt,answer,choices){return {prompt,answer:String(answer),choices:choices?choices.map(String):null}}
function choices(ans){let s=new Set([String(ans)]);while(s.size<4){let n=Number(ans)+Math.floor(Math.random()*19)-9;if(n>=0)s.add(String(n))}return shuffle([...s])}
function makeFacts(op){let out=[];for(let a=1;a<=12;a++)for(let b=1;b<=12;b++){if(op==='×')out.push(q(`${a} × ${b} = ?`,a*b,choices(a*b)));else out.push(q(`${a*b} ÷ ${a} = ?`,b,choices(b)))}return out}
function wordOne(){let out=[];for(let a=8;a<40;a+=2)for(let b=3;b<12;b+=2)out.push(q(`A team has ${a} flags. They add ${b} more. How many flags now?`,a+b,choices(a+b)));for(let a=18;a<60;a+=3)for(let b=2;b<9;b++)out.push(q(`${a} campers share into ${b} equal groups. How many in each group?`,Math.floor(a/b),choices(Math.floor(a/b))));return out}
function wordTwo(){let out=[];for(let a=4;a<=12;a++)for(let b=3;b<=9;b++)out.push(q(`There are ${a} packs with ${b} badges each. Then 6 badges are added. How many badges?`,a*b+6,choices(a*b+6)));for(let a=20;a<=60;a+=5)for(let b=3;b<=8;b++)out.push(q(`A class has ${a} tickets. They use ${b}. Then they split the rest between 2 teams. How many per team?`,(a-b)/2,choices((a-b)/2)));return out.filter(x=>Number.isInteger(Number(x.answer)))}
function placeValue(){let out=[];for(let n=100;n<=999;n+=17){let h=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10;out.push(q(`In ${n}, what digit is in the tens place?`,t,[h,t,o,(t+1)%10]));out.push(q(`${h} hundreds, ${t} tens, and ${o} ones is what number?`,n,choices(n)))}return out}
function rounding(){let out=[];for(let n=105;n<=995;n+=13){out.push(q(`Round ${n} to the nearest 10.`,Math.round(n/10)*10,choices(Math.round(n/10)*10)));out.push(q(`Round ${n} to the nearest 100.`,Math.round(n/100)*100,choices(Math.round(n/100)*100)))}return out}
function addSub(op){let out=[];for(let a=120;a<900;a+=37)for(let b=45;b<300;b+=41){if(op==='+')out.push(q(`${a} + ${b} = ?`,a+b));else if(a>b)out.push(q(`${a} - ${b} = ?`,a-b))}return out}
function multiples10(){let out=[];for(let a=1;a<=12;a++)for(let b of [10,20,30,40,50,60,70,80,90])out.push(q(`${a} × ${b} = ?`,a*b,choices(a*b)));return out}
function fractionLine(){let out=[];for(let d=2;d<=8;d++)for(let n=1;n<d;n++)out.push(q(`A number line from 0 to 1 is split into ${d} equal parts. What is point ${n}?`,`${n}/${d}`,[`${n}/${d}`,`${d}/${n}`,`${n+1}/${d}`,`${n}/${d+1}`]));return out}
function compareFractions(){let out=[];for(let d=3;d<=9;d++)for(let a=1;a<d-1;a++)out.push(q(`Which is greater: ${a}/${d} or ${a+1}/${d}?`,`${a+1}/${d}`,[`${a}/${d}`,`${a+1}/${d}`]));for(let n=1;n<=5;n++)for(let d=3;d<=10;d++)if(n<d-1)out.push(q(`Which is greater: ${n}/${d} or ${n}/${d+1}?`,`${n}/${d}`,[`${n}/${d}`,`${n}/${d+1}`]));return out}
function partsWhole(){let out=[];for(let d=2;d<=12;d++)for(let n=1;n<d;n++)out.push(q(`${n} out of ${d} equal parts are shaded. What fraction is shaded?`,`${n}/${d}`,[`${n}/${d}`,`${d}/${n}`,`${n+1}/${d}`,`${n}/${d+1}`]));return out}
function timeBank(){let out=[];for(let h=1;h<=12;h++)for(let m of [0,5,10,15,20,25,30,35,40,45,50,55]){let mm=String(m).padStart(2,'0');out.push(q(`What time is ${h}:${mm} in words?`,`${h}:${mm}`,[`${h}:${mm}`,`${m}:${String(h).padStart(2,'0')}`,`${h}:${String((m+5)%60).padStart(2,'0')}`,`${(h%12)+1}:${mm}`]))}return out}
function areaBank(){let out=[];for(let l=2;l<=12;l++)for(let w=2;w<=10;w++)out.push(q(`A rectangle is ${l} units by ${w} units. What is the area?`,l*w));return out}
function perimeterBank(){let out=[];for(let l=2;l<=16;l++)for(let w=2;w<=12;w++)out.push(q(`A rectangle is ${l} units by ${w} units. What is the perimeter?`,2*l+2*w));return out}
function partitionBank(){let out=[];for(let p=2;p<=12;p++)out.push(q(`A shape is split into ${p} equal parts. One part is what fraction?`,`1/${p}`,[`1/${p}`,`${p}/1`,`2/${p}`,`1/${p+1}`]));return out}
