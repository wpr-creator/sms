const FlightSchoolBank = (() => {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a,b) => a[0]-b[0]).map(v => v[1]);
  const choices = answer => {
    const set = new Set([answer]);
    while (set.size < 4) {
      const wiggle = rand(-12, 12);
      const candidate = Math.max(0, answer + wiggle || answer + rand(1, 9));
      set.add(candidate);
    }
    return shuffle([...set]);
  };
  const q = (prompt, answer, type = 'choice') => ({ prompt, answer, choices: choices(answer), type });

  const generators = {
    multiplication: () => { const a=rand(2,12), b=rand(2,12); return q(`${a} × ${b} = ?`, a*b, 'clouds'); },
    division: () => { const b=rand(2,12), ans=rand(2,12), a=b*ans; return q(`${a} ÷ ${b} = ?`, ans, 'nests'); },
    place: () => { const n=rand(100,999); const kind=['hundreds','tens','ones'][rand(0,2)]; const ans=kind==='hundreds'?Math.floor(n/100):kind==='tens'?Math.floor((n%100)/10):n%10; return q(`In ${n}, how many ${kind}?`, ans, 'blocks'); },
    rounding: () => { const n=rand(101,999); const near=Math.random()<.5?10:100; const ans=Math.round(n/near)*near; const item=q(`Round ${n} to the nearest ${near}.`, ans, 'perches'); item.choices=shuffle([ans, ans-near, ans+near, Math.max(0, ans+(Math.random()<.5?-2:2)*near)]); return item; },
    addition: () => { const a=rand(100,699), b=rand(80,300); return q(`${a} + ${b} = ?`, a+b, 'rings'); },
    subtraction: () => { const a=rand(300,999), b=rand(100,Math.min(599,a-1)); return q(`${a} - ${b} = ?`, a-b, 'rings'); },
    multiples10: () => { const a=rand(2,9)*10, b=rand(2,9); return q(`${a} × ${b} = ?`, a*b, 'rings'); },
    fractionsLine: () => { const den=[2,3,4,6,8][rand(0,4)], num=rand(1,den-1); return {prompt:`Which point shows ${num}/${den}?`, answer:`${num}/${den}`, choices:shuffle([`${num}/${den}`,`${Math.max(1,num-1)}/${den}`,`${Math.min(den-1,num+1)}/${den}`,`${num}/${den+1}`]), type:'numberline'}; },
    fractionCompare: () => { const sameDen=Math.random()<.5; let a,b,c,d; if(sameDen){ d=[3,4,6,8][rand(0,3)]; b=d; a=rand(1,d-1); c=rand(1,d-1); if(a===c)c=Math.min(d-1,c+1); } else { a=rand(1,5); c=a; b=[3,4,6,8][rand(0,3)]; d=[3,4,6,8][rand(0,3)]; if(b===d)d=b===8?4:8; } const left=a/b, right=c/d; const ans= left>right ? '>' : '<'; return {prompt:`Choose the sign: ${a}/${b} __ ${c}/${d}`, answer:ans, choices:shuffle(['>','<','=']), type:'compare'}; },
    partsWhole: () => { const den=[2,3,4,6,8][rand(0,4)], num=rand(1,den); return {prompt:`A shape has ${den} equal parts. ${num} are shaded. What fraction is shaded?`, answer:`${num}/${den}`, choices:shuffle([`${num}/${den}`,`${den}/${num}`,`${Math.max(1,num-1)}/${den}`,`${num}/${den+1}`]), type:'tiles'}; },
    time: () => { const h=rand(1,12), m=[0,5,10,15,20,25,30,35,40,45,50,55][rand(0,11)]; const answer=`${h}:${String(m).padStart(2,'0')}`; return {prompt:`What time is shown on the tower clock?`, answer, choices:shuffle([answer,`${h}:${String((m+5)%60).padStart(2,'0')}`,`${h===12?1:h+1}:${String(m).padStart(2,'0')}`,`${h}:${String((m+10)%60).padStart(2,'0')}`]), clock:{h,m}, type:'clock'}; },
    area: () => { const l=rand(2,12), w=rand(2,10); return q(`A rectangle is ${l} by ${w}. What is the area?`, l*w, 'tiles'); },
    perimeter: () => { const l=rand(3,14), w=rand(2,10); return q(`A rectangle is ${l} by ${w}. What is the perimeter?`, 2*(l+w), 'fence'); },
    word1: () => { const a=rand(3,12), b=rand(2,9); return q(`There are ${a} teams with ${b} students on each team. How many students?`, a*b, 'story'); },
    word2: () => { const a=rand(10,40), b=rand(5,20), c=rand(2,10); return q(`A class has ${a} pencils. They get ${b} more. Then they give away ${c}. How many are left?`, a+b-c, 'story'); }
  };
  return { generators };
})();
