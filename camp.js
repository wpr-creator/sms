document.querySelectorAll('.camp-card.active').forEach(card=>{
  card.addEventListener('click',()=>{
    try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.type='triangle';o.frequency.value=740;g.gain.value=.05;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);o.stop(ctx.currentTime+.12)}catch(e){}
  });
});
