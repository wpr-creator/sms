(function(){
  const r=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const uniqueOptions=(answer, extras, count=4)=>{
    const set=new Set([answer]);
    shuffle(extras).forEach(v=>{ if(set.size<count && v!==answer) set.add(v); });
    let guard=0;
    while(set.size<count && guard<80){ set.add(answer+r(-12,12)); guard++; }
    return shuffle([...set]);
  };
  const fracText=(n,d)=>`${n}/${d}`;
  const missions=[
    {id:'multiplication', name:'MULTIPLICATION CANYON', badge:'CANYON PILOT', bg:'bg-canyon.png', type:'cloud'},
    {id:'division', name:'DIVISION NEST', badge:'NEST NAVIGATOR', bg:'bg-nest.png', type:'perch'},
    {id:'oneStep', name:'WORD PROBLEM RUNWAY', badge:'RUNWAY READER', bg:'bg-camp.png', type:'cloud'},
    {id:'twoStep', name:'TWO-STEP SKYWAY', badge:'SKYWAY SOLVER', bg:'bg-canyon.png', type:'cloud'},
    {id:'placeValue', name:'PLACE VALUE PEAKS', badge:'PEAK BUILDER', bg:'bg-peaks.png', type:'block'},
    {id:'rounding', name:'ROUNDING RAPIDS', badge:'RAPID RIDER', bg:'bg-rapids.png', type:'perch'},
    {id:'addition', name:'ADDITION OUTPOST', badge:'SUM BUILDER', bg:'bg-area.png', type:'block'},
    {id:'subtraction', name:'SUBTRACTION RIDGE', badge:'DIFFERENCE DASHER', bg:'bg-ridge.png', type:'perch'},
    {id:'tens', name:'TENS TAKEOFF', badge:'TENS PILOT', bg:'bg-canyon.png', type:'cloud'},
    {id:'fracLine', name:'FRACTION FOREST TRAIL', badge:'FRACTION FINDER', bg:'bg-forest.png', type:'line'},
    {id:'fracCompare', name:'FRACTION FOREST DUEL', badge:'FRACTION SCOUT', bg:'bg-forest.png', type:'cloud'},
    {id:'partsWhole', name:'PARTS OF A WHOLE', badge:'WHOLE BUILDER', bg:'bg-forest.png', type:'block'},
    {id:'time', name:'TIME TOWER', badge:'TIME KEEPER', bg:'bg-tower.png', type:'clock'},
    {id:'area', name:'AREA OUTPOST', badge:'AREA ARCHITECT', bg:'bg-area.png', type:'tile'},
    {id:'perimeter', name:'PERIMETER RIDGE', badge:'RIDGE RANGER', bg:'bg-ridge.png', type:'perch'},
    {id:'partition', name:'SHAPE SPLIT SKY', badge:'SHAPE SPLITTER', bg:'bg-peaks.png', type:'block'}
  ];
  function makeQuestion(id, boss=false){
    if(id==='multiplication'){const a=r(boss?6:2,12),b=r(2,12),ans=a*b;return q(`${a} × ${b} = ?`,ans,uniqueOptions(ans,[ans+a,ans-a,ans+b,ans-b,a+b,a*b+10,a*b-10]));}
    if(id==='division'){const b=r(2,12),ans=r(2,12),total=b*ans;return q(`${total} ÷ ${b} = ?`,ans,uniqueOptions(ans,[ans+1,ans-1,ans+2,ans-2,b,total]));}
    if(id==='oneStep'){const a=r(8,75),b=r(5,48),add=Math.random()>.5,ans=add?a+b:a-b;return q(add?`A pilot earns ${a} points, then earns ${b} more. How many points?`:`A pilot has ${a} points and spends ${b}. How many are left?`,ans,uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,a,b]));}
    if(id==='twoStep'){const a=r(10,40),b=r(5,35),c=r(3,20),ans=a+b-c;return q(`A team has ${a} badges. They earn ${b} more and trade ${c}. How many badges now?`,ans,uniqueOptions(ans,[a+b,ans+1,ans-1,ans+10,ans-10,c]));}
    if(id==='placeValue'){
      const h=r(1,9),t=r(0,9),o=r(0,9),num=h*100+t*10+o;
      const mode=r(1,4);
      if(mode===1){return {prompt:`Build the number: ${h} hundreds, ${t} tens, and ${o} ones.`,answer:String(num),answers:[String(num)],kind:'input',inputMode:'numeric',placeholder:'Type the number',helper:'Use hundreds, tens, and ones to type the full number.'};}
      if(mode===2){const digit=[h,t,o][r(0,2)],place=digit===h?'hundreds':digit===t?'tens':'ones';const value=place==='hundreds'?h*100:place==='tens'?t*10:o;return {prompt:`What is the value of the ${digit} in ${num}?`,answer:String(value),answers:[String(value)],kind:'input',inputMode:'numeric',placeholder:'Type the value',helper:'Value means what the digit is worth in its place.'};}
      if(mode===3){const parts=[`${h*100}`,`${t*10}`,`${o}`].filter(x=>x!=='0');const expanded=parts.join(' + ');return {prompt:`Write ${num} in expanded form.`,answer:expanded,answers:[expanded,parts.join('+')],kind:'input',placeholder:'Example: 400 + 30 + 8',helper:'Show the value of each digit.'};}
      const expanded=[h*100,t*10,o].filter(x=>x!==0).join(' + ');return {prompt:`What number is ${expanded}?`,answer:String(num),answers:[String(num)],kind:'input',inputMode:'numeric',placeholder:'Type the number',helper:'Add the expanded form to make the number.'};
    }
    if(id==='rounding'){const n=r(101,999),toHund=Math.random()>.5,ans=toHund?Math.round(n/100)*100:Math.round(n/10)*10;return q(`Round ${n} to the nearest ${toHund?100:10}.`,ans,uniqueOptions(ans,[ans+10,ans-10,ans+100,ans-100,Math.floor(n/10)*10,Math.ceil(n/10)*10]));}
    if(id==='addition'){const a=r(120,699),b=r(105,299),ans=a+b;return q(`${a} + ${b} = ?`,ans,uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,ans+100,ans-100]));}
    if(id==='subtraction'){const a=r(300,999),b=r(100,Math.min(599,a-20)),ans=a-b;return q(`${a} - ${b} = ?`,ans,uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,ans+100,ans-100]));}
    if(id==='tens'){const a=r(2,9),b=r(1,9)*10,ans=a*b;return q(`${a} × ${b} = ?`,ans,uniqueOptions(ans,[ans+10,ans-10,ans+100,ans-100,a*b/10,a+b]));}
    if(id==='fracLine'){const d=[2,3,4,6,8][r(0,4)],n=r(1,d-1);return {prompt:`Find ${fracText(n,d)} on the trail.`,answer:fracText(n,d),options:shuffle(Array.from({length:d+1},(_,i)=>fracText(i,d))).slice(0,7).includes(fracText(n,d))?shuffle(Array.from({length:d+1},(_,i)=>fracText(i,d))).slice(0,7):shuffle([fracText(n,d),fracText(r(0,d),d),fracText(r(0,d),d),fracText(r(0,d),d),fracText(r(0,d),d),fracText(r(0,d),d),fracText(r(0,d),d)]),kind:'line'};}
    if(id==='fracCompare'){const sameDen=Math.random()>.5;let a,b,c,d;if(sameDen){d=[3,4,6,8][r(0,3)];a=r(1,d-1);b=r(1,d-1);c=a;while(c===a)c=r(1,d-1);return q(`Which fraction is greater?`, a>c?fracText(a,d):fracText(c,d), shuffle([fracText(a,d),fracText(c,d),fracText(1,d),fracText(d-1,d)]), 'choice');}else{a=r(1,5);b=r(a+1,8);d=r(a+1,8);return q(`Which fraction is greater?`, b<d?fracText(a,b):fracText(a,d), shuffle([fracText(a,b),fracText(a,d),fracText(1,b),fracText(1,d)]), 'choice');}}
    if(id==='partsWhole'){const d=[2,3,4,6,8][r(0,4)],n=r(1,d-1);return q(`A shape has ${d} equal parts. ${n} parts are shaded. What fraction is shaded?`,fracText(n,d),shuffle([fracText(n,d),fracText(d,n),fracText(1,d),fracText(d-n,d)]),'choice');}
    if(id==='time'){const hour=r(1,12),minute=[0,5,10,15,20,25,30,35,40,45,50,55][r(0,11)],ans=`${hour}:${String(minute).padStart(2,'0')}`;const opts=uniqueOptions(minute,[0,5,10,15,20,25,30,35,40,45,50,55],4).map(m=>`${hour}:${String(Math.max(0,Math.min(55,m))).padStart(2,'0')}`);return {prompt:`Choose the clock that shows ${ans}.`,answer:ans,options:shuffle([...new Set([ans,...opts])]).slice(0,4),kind:'clock',hour,minute};}
    if(id==='area'){const l=r(3,12),w=r(2,10),ans=l*w;return q(`A rectangle is ${l} units by ${w} units. What is the area?`,ans,uniqueOptions(ans,[ans+l,ans+w,l+w,2*l+2*w,ans-1,ans+1]));}
    if(id==='perimeter'){const l=r(3,15),w=r(2,12),ans=2*l+2*w;return q(`A rectangle is ${l} units by ${w} units. What is the perimeter?`,ans,uniqueOptions(ans,[l*w,l+w,ans+2,ans-2,ans+10,ans-10]));}
    if(id==='partition'){const parts=[2,3,4,6,8][r(0,4)];return q(`A shape is split into ${parts} equal parts. Each part is one what?`,fracText(1,parts),shuffle([fracText(1,parts),fracText(parts,1),fracText(parts,parts),fracText(2,parts)]),'choice');}
    return q('3 + 4 = ?',7,[7,6,8,9]);
  }
  function q(prompt,answer,options,kind){return {prompt,answer:String(answer),options:options.map(String),kind:kind||'choice'};}
  function makeMissionQuestions(id,total=15){const arr=[];for(let i=0;i<total;i++) arr.push(makeQuestion(id,[4,9,14].includes(i)));return arr;}
  window.FS_QUESTIONS={missions,makeMissionQuestions};
})();
