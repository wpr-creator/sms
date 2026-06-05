window.FS_BANK = {
  multiplication(){
    let a = 2 + Math.floor(Math.random() * 11);
    let b = 2 + Math.floor(Math.random() * 11);
    return q(`${a} × ${b} = ?`, a * b);
  },
  division(){
    let b = 2 + Math.floor(Math.random() * 11);
    let a = 2 + Math.floor(Math.random() * 11);
    return q(`${a * b} ÷ ${b} = ?`, a);
  },
  placeValue(){
    let h = 1 + Math.floor(Math.random() * 8);
    let t = Math.floor(Math.random() * 10);
    let o = Math.floor(Math.random() * 10);
    return q(`${h} hundreds, ${t} tens, ${o} ones`, h * 100 + t * 10 + o, 70);
  },
  rounding(){
    let n = 100 + Math.floor(Math.random() * 850);
    let by = Math.random() < .5 ? 10 : 100;
    return q(`Round ${n} to the nearest ${by}`, Math.round(n / by) * by, by * 2);
  },
  fractions(){
    let d = [2,3,4,6,8][Math.floor(Math.random() * 5)];
    let n = 1 + Math.floor(Math.random() * (d - 1));
    return qText(`Which fraction shows ${n} of ${d} equal parts?`, `${n}/${d}`);
  },
  time(){
    let hr = 1 + Math.floor(Math.random() * 12);
    let min = [0,5,10,15,20,25,30,35,40,45,50,55][Math.floor(Math.random() * 12)];
    return qText(`What time is ${hr} hours and ${min} minutes?`, `${hr}:${String(min).padStart(2,'0')}`);
  },
  area(){
    let w = 2 + Math.floor(Math.random() * 8);
    let h = 2 + Math.floor(Math.random() * 8);
    return q(`Area: ${w} rows of ${h}`, w * h);
  },
  perimeter(){
    let w = 2 + Math.floor(Math.random() * 9);
    let h = 2 + Math.floor(Math.random() * 9);
    return q(`Perimeter of ${w} by ${h}`, 2 * (w + h));
  }
};
function q(prompt, answer, spread = 12){
  let opts = new Set([answer]);
  while(opts.size < 4){
    opts.add(Math.max(0, answer + Math.floor(Math.random() * spread) - Math.floor(spread / 2)));
  }
  return {prompt, answer, options:[...opts].sort(() => Math.random() - .5)};
}
function qText(prompt, answer){
  let opts = new Set([answer]);
  while(opts.size < 4){
    opts.add(`${1 + Math.floor(Math.random() * 7)}/${2 + Math.floor(Math.random() * 7)}`);
  }
  return {prompt, answer, options:[...opts].sort(() => Math.random() - .5)};
}
