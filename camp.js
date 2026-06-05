(function(){
  const wipe=document.getElementById('pageWipe');
  const badges=JSON.parse(localStorage.getItem('fs_badges')||'[]');
  const rank=document.getElementById('campRank');
  const badgeCount=document.getElementById('badgeCount');
  const strip=document.getElementById('badgeStrip');
  if(rank){rank.textContent=badges.length>=12?'ACE':badges.length>=6?'SKY SCOUT':badges.length>=1?'CADET':'ROOKIE'}
  if(badgeCount){badgeCount.textContent=String(badges.length)}
  if(strip){strip.textContent=badges.length?badges.slice(-6).join('  •  '):'BADGES WILL SHOW HERE'}
  const sound=(f=660,d=.08)=>{try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.frequency.value=f;o.type='triangle';g.gain.value=.045;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.stop(a.currentTime+d)}catch(e){}}
  document.querySelectorAll('[data-camp-go]').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();sound(720,.08); if(wipe) wipe.classList.add('on');
      setTimeout(()=>{window.location.href=link.getAttribute('href')},260);
    });
  });
})();
