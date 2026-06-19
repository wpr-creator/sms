(function(){
  const r=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const fracText=(n,d)=>`${n}/${d}`;

  function uniqueOptions(answer, extras, count=4){
    const set=new Set([String(answer)]);
    shuffle(extras.map(String)).forEach(v=>{ if(set.size<count && v!==String(answer)) set.add(v); });
    let guard=0;
    const base=Number(answer);
    while(set.size<count && Number.isFinite(base) && guard<80){
      const v=String(base+r(-12,12));
      if(v!==String(answer)) set.add(v);
      guard++;
    }
    return shuffle([...set]).slice(0,count);
  }

  const missions=[
    {id:'multiplication', name:'MULTIPLICATION CANYON', badge:'CANYON PILOT', bg:'assets/backgrounds/bg-canyon.png', type:'cloud', tag:'Cross the canyon by finding the correct product.'},
    {id:'division', name:'DIVISION NEST', badge:'NEST NAVIGATOR', bg:'assets/backgrounds/bg-nest.png', type:'perch', tag:'Land safely in the nest by solving each division challenge.'},
    {id:'oneStep', name:'WORD PROBLEM RUNWAY', badge:'RUNWAY READER', bg:'assets/backgrounds/bg-camp.png', type:'cloud', tag:'Read the runway story and choose the safe answer.'},
    {id:'twoStep', name:'TWO-STEP SKYWAY', badge:'SKYWAY SOLVER', bg:'assets/backgrounds/bg-canyon.png', type:'cloud', tag:'Solve both steps to stay on the skyway.'},
    {id:'placeValue', name:'PLACE VALUE PEAKS', badge:'PEAK BUILDER', bg:'assets/backgrounds/bg-peaks.png', type:'block', tag:'Build, compare, and explain numbers by place value.'},
    {id:'rounding', name:'ROUNDING RAPIDS', badge:'RAPID RIDER', bg:'assets/backgrounds/bg-rapids.png', type:'perch', tag:'Ride the rapids by rounding to the nearest safe spot.'},
    {id:'addition', name:'ADDITION OUTPOST', badge:'SUM BUILDER', bg:'assets/backgrounds/bg-area.png', type:'block', tag:'Build the outpost by adding within 1,000.'},
    {id:'subtraction', name:'SUBTRACTION RIDGE', badge:'DIFFERENCE DASHER', bg:'assets/backgrounds/bg-ridge.png', type:'perch', tag:'Cross the ridge by finding the difference.'},
    {id:'tens', name:'TENS TAKEOFF', badge:'TENS PILOT', bg:'assets/backgrounds/bg-canyon.png', type:'cloud', tag:'Take off by multiplying with tens.'},
    {id:'fracLine', name:'FRACTION FOREST TRAIL', badge:'FRACTION FINDER', bg:'assets/backgrounds/bg-forest.png', type:'line', tag:'Follow the forest trail to find each fraction.'},
    {id:'fracCompare', name:'FRACTION FOREST DUEL', badge:'FRACTION SCOUT', bg:'assets/backgrounds/bg-forest.png', type:'cloud', tag:'Choose the greater fraction to win the forest duel.'},
    {id:'partsWhole', name:'PARTS OF A WHOLE', badge:'WHOLE BUILDER', bg:'assets/backgrounds/bg-forest.png', type:'block', tag:'Build the whole by naming equal parts.'},
    {id:'time', name:'TIME TOWER', badge:'TIME KEEPER', bg:'assets/backgrounds/bg-tower.png', type:'clock', tag:'Climb Time Tower by reading each clock.'},
    {id:'area', name:'AREA OUTPOST', badge:'AREA ARCHITECT', bg:'assets/backgrounds/bg-area.png', type:'tile', tag:'Map the outpost by finding the area.'},
    {id:'perimeter', name:'PERIMETER RIDGE', badge:'RIDGE RANGER', bg:'assets/backgrounds/bg-ridge.png', type:'perch', tag:'Trace the ridge by finding perimeter.'},
    {id:'partition', name:'SHAPE SPLIT SKY', badge:'SHAPE SPLITTER', bg:'assets/backgrounds/bg-peaks.png', type:'block', tag:'Split each shape into equal shares.'}
  ];

  function q(prompt,answer,options,kind){
    return {prompt,answer:String(answer),options:options.map(String),kind:kind||'choice'};
  }

  function inputQ(prompt,answer,helper,placeholder='Type answer',inputMode='text',answers){
    return {prompt,answer:String(answer),answers:(answers||[String(answer)]).map(String),kind:'input',helper,placeholder,inputMode};
  }

  function makeQuestion(id,boss=false){
    if(id==='multiplication'){
      const a=r(boss?6:2,12), b=r(2,12), ans=a*b;
      return q(`${a} × ${b} = ?`, ans, uniqueOptions(ans,[ans+a,ans-a,ans+b,ans-b,a+b,ans+10,ans-10]));
    }

    if(id==='division'){
      const divisor=r(2,12), ans=r(boss?6:2,12), total=divisor*ans;
      return q(`${total} ÷ ${divisor} = ?`, ans, uniqueOptions(ans,[ans+1,ans-1,ans+2,ans-2,divisor,total]));
    }

    if(id==='oneStep'){
      const a=r(12,85), b=r(5,48), add=Math.random()>.5, ans=add?a+b:a-b;
      return q(add?`A pilot earns ${a} points and then earns ${b} more. How many points?`:`A pilot has ${a} points and spends ${b}. How many are left?`, ans, uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,a,b]));
    }

    if(id==='twoStep'){
      const a=r(10,40), b=r(8,35), c=r(3,20), ans=a+b-c;
      return q(`A team has ${a} badges. They earn ${b} more and trade ${c}. How many badges now?`, ans, uniqueOptions(ans,[a+b,ans+1,ans-1,ans+10,ans-10,c]));
    }

    if(id==='placeValue'){
      const h=r(1,9), t=r(0,9), o=r(0,9), num=h*100+t*10+o;
      const onesWords=['zero','one','two','three','four','five','six','seven','eight','nine'];
      const teenWords={10:'ten',11:'eleven',12:'twelve',13:'thirteen',14:'fourteen',15:'fifteen',16:'sixteen',17:'seventeen',18:'eighteen',19:'nineteen'};
      const tensWords={20:'twenty',30:'thirty',40:'forty',50:'fifty',60:'sixty',70:'seventy',80:'eighty',90:'ninety'};
      function under100(n){ if(n<10) return onesWords[n]; if(n<20) return teenWords[n]; const t=Math.floor(n/10)*10, o=n%10; return o?`${tensWords[t]}-${onesWords[o]}`:tensWords[t]; }
      function wordForm(n){ const h=Math.floor(n/100), rest=n%100; return rest?`${onesWords[h]} hundred ${under100(rest)}`:`${onesWords[h]} hundred`; }
      const mode=r(1,boss?8:7);
      if(mode===1) return inputQ(`Build the number: ${h} hundreds, ${t} tens, and ${o} ones.`, num, 'Use hundreds, tens, and ones to type the full number.','Type the number','numeric');
      if(mode===2){
        const placeChoice=shuffle(['hundreds','tens','ones'])[0];
        const digit=placeChoice==='hundreds'?h:placeChoice==='tens'?t:o;
        const value=placeChoice==='hundreds'?h*100:placeChoice==='tens'?t*10:o;
        return inputQ(`What is the value of the ${digit} in ${num}?`, value, 'Value means what the digit is worth in its place.','Type the value','numeric');
      }
      if(mode===3){
        const parts=[h*100,t*10,o].filter(x=>x!==0);
        const expanded=parts.join(' + ');
        return inputQ(`Write ${num} in expanded form.`, expanded, 'Show the value of each digit.','Example: 400 + 30 + 8','text',[expanded,parts.join('+')]);
      }
      if(mode===4){
        const expanded=[h*100,t*10,o].filter(x=>x!==0).join(' + ');
        return inputQ(`What number is ${expanded}?`, num, 'Add the expanded form to make the number.','Type the number','numeric');
      }
      if(mode===5){
        let compare=num+r(-75,75); if(compare<100) compare+=100; if(compare>999) compare-=100; if(compare===num) compare+=10;
        return q(`Which number is greater?`, Math.max(num,compare), shuffle([num,compare,Math.max(100,num-10),Math.min(999,compare+10)]));
      }
      if(mode===6){
        const nums=shuffle([num, num+r(1,40), Math.max(100,num-r(1,40))]).map(n=>Math.max(100,Math.min(999,n)));
        const ans=[...nums].sort((a,b)=>a-b).join(', ');
        return inputQ(`Put these numbers in order from least to greatest: ${nums.join(', ')}`, ans, 'Type the numbers in order with commas between them.','Example: 214, 241, 421','text',[ans, ans.replace(/, /g,',')]);
      }
      if(mode===7){
        return inputQ(`Write ${num} in word form.`, wordForm(num), 'Word form means writing the number using words.','Example: four hundred thirty-eight','text',[wordForm(num), wordForm(num).replace(/-/g,' ')]);
      }
      const values=[['hundreds',h*100],['tens',t*10],['ones',o]].filter(x=>x[1]>0);
      const biggest=values.sort((a,b)=>b[1]-a[1])[0];
      return q(`In ${num}, which place has the greatest value?`, biggest[0], shuffle(['hundreds','tens','ones','all equal']));
    }

    if(id==='rounding'){
      const n=r(101,999), toHund=Math.random()>.5, ans=toHund?Math.round(n/100)*100:Math.round(n/10)*10;
      return q(`Round ${n} to the nearest ${toHund?100:10}.`, ans, uniqueOptions(ans,[ans+10,ans-10,ans+100,ans-100,Math.floor(n/10)*10,Math.ceil(n/10)*10]));
    }

    if(id==='addition'){
      const a=r(120,699), b=r(105,299), ans=a+b;
      return q(`${a} + ${b} = ?`, ans, uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,ans+100,ans-100]));
    }

    if(id==='subtraction'){
      const a=r(300,999), b=r(100,Math.min(599,a-20)), ans=a-b;
      return q(`${a} - ${b} = ?`, ans, uniqueOptions(ans,[ans+1,ans-1,ans+10,ans-10,ans+100,ans-100]));
    }

    if(id==='tens'){
      const a=r(2,9), b=r(1,9)*10, ans=a*b;
      return q(`${a} × ${b} = ?`, ans, uniqueOptions(ans,[ans+10,ans-10,ans+100,ans-100,a*(b/10),a+b]));
    }

    if(id==='fracLine'){
      const d=shuffle([2,3,4,6,8])[0], n=r(1,d-1);
      const all=Array.from({length:d+1},(_,i)=>fracText(i,d));
      return {prompt:`Find ${fracText(n,d)} on the trail.`,answer:fracText(n,d),options:all,kind:'line'};
    }

    if(id==='fracCompare'){
      if(Math.random()>.5){
        const d=shuffle([3,4,6,8])[0]; let a=r(1,d-1), c=r(1,d-1); while(c===a)c=r(1,d-1);
        return q(`Which fraction is greater?`, a>c?fracText(a,d):fracText(c,d), shuffle([fracText(a,d),fracText(c,d),fracText(1,d),fracText(d-1,d)]));
      }
      const n=r(1,4); let d1=r(n+1,8), d2=r(n+1,8); while(d2===d1)d2=r(n+1,8);
      return q(`Which fraction is greater?`, d1<d2?fracText(n,d1):fracText(n,d2), shuffle([fracText(n,d1),fracText(n,d2),fracText(1,d1),fracText(1,d2)]));
    }

    if(id==='partsWhole'){
      const d=shuffle([2,3,4,6,8])[0], n=r(1,d-1);
      return q(`A shape has ${d} equal parts. ${n} parts are shaded. What fraction is shaded?`, fracText(n,d), shuffle([fracText(n,d),fracText(d,n),fracText(1,d),fracText(d-n,d)]));
    }

    if(id==='time'){
      const hour=r(1,12), minute=shuffle([0,5,10,15,20,25,30,35,40,45,50,55])[0];
      const ans=`${hour}:${String(minute).padStart(2,'0')}`;
      const minuteOptions=shuffle([minute, (minute+5)%60, (minute+10)%60, Math.max(0,minute-5)]).slice(0,4);
      const opts=shuffle([...new Set(minuteOptions.map(m=>`${hour}:${String(m).padStart(2,'0')}`)), ans]).slice(0,4);
      if(!opts.includes(ans)) opts[0]=ans;
      return {prompt:`Choose the clock that shows ${ans}.`,answer:ans,options:shuffle(opts),kind:'clock'};
    }

    if(id==='area'){
      const l=r(3,12), w=r(2,10), ans=l*w;
      return q(`A rectangle is ${l} units by ${w} units. What is the area?`, ans, uniqueOptions(ans,[ans+l,ans+w,l+w,2*l+2*w,ans-1,ans+1]));
    }

    if(id==='perimeter'){
      const l=r(3,15), w=r(2,12), ans=2*l+2*w;
      return q(`A rectangle is ${l} units by ${w} units. What is the perimeter?`, ans, uniqueOptions(ans,[l*w,l+w,ans+2,ans-2,ans+10,ans-10]));
    }

    if(id==='partition'){
      const parts=shuffle([2,3,4,6,8])[0];
      return q(`A shape is split into ${parts} equal parts. Each part is one what?`, fracText(1,parts), shuffle([fracText(1,parts),fracText(parts,1),fracText(parts,parts),fracText(2,parts)]));
    }

    return q('3 + 4 = ?',7,[7,6,8,9]);
  }

  function makeMissionQuestions(id,total=15){
    const arr=[];
    for(let i=0;i<total;i++) arr.push(makeQuestion(id,[4,9,14].includes(i)));
    return arr;
  }

  window.FS_QUESTIONS={missions,makeMissionQuestions};
})();