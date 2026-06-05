(function(){
  const progress = JSON.parse(localStorage.getItem('flightSchoolProgress') || '{}');
  const badges = progress.badges || [];
  const rank = badges.length >= 8 ? 'SKY CAPTAIN' : badges.length >= 4 ? 'WING LEADER' : badges.length >= 1 ? 'SKY SCOUT' : 'ROOKIE FLYER';
  const rankEl = document.getElementById('campRank');
  const badgeEl = document.getElementById('campBadges');
  const progEl = document.getElementById('campProgress');
  if(rankEl) rankEl.textContent = rank;
  if(badgeEl) badgeEl.textContent = badges.length;
  if(progEl) progEl.textContent = badges.length ? `${Math.min(badges.length, 10)}/10` : 'READY';
})();
