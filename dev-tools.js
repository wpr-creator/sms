(() => {
  const TRIGGER = "dev";
  const SAVE_KEY = "falconCampSave";
  let buffer = "";

  function safeJSON(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch(e){ return fallback; }
  }
  function writeJSON(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }
  function getSave(){
    return safeJSON(SAVE_KEY, {});
  }
  function setFlag(flag, value=true){
    const save = getSave();
    save[flag] = value;
    writeJSON(SAVE_KEY, save);
  }
  function completeAllPaths(){
    const save = getSave();
    save.flightSchoolComplete = true;
    save.fieldLabComplete = true;
    save.expeditionComplete = true;
    save.stormWatchComplete = true;
    writeJSON(SAVE_KEY, save);
  }
  function detectPage(){
    const p = location.pathname.split("/").pop() || "index.html";
    if(p.includes("flight-school")) return {name:"Flight School", flag:"flightSchoolComplete", keys:["flight_school_progress_v19","flight_school_badges_v19"]};
    if(p.includes("field-lab")) return {name:"Field Lab", flag:"fieldLabComplete", keys:["field_lab_progress"]};
    if(p.includes("expedition-corps")) return {name:"Expedition Corps", flag:"expeditionComplete", keys:["expedition_progress"]};
    if(p.includes("storm-watch")) return {name:"Severe Weather", flag:"stormWatchComplete", keys:[]};
    if(p.includes("pizza-parlor")) return {name:"Pizza Parlor", flag:null, keys:["pizza_parlor_collectibles"]};
    return {name:"Falcon Camp", flag:null, keys:[]};
  }
  function makePanel(){
    if(document.getElementById("falconDevPanel")) return;
    const style = document.createElement("style");
    style.textContent = `
      .falcon-dev-panel{position:fixed;right:18px;bottom:18px;z-index:99999;width:min(380px,92vw);background:#061b3dee;color:white;border:4px solid #ffc83d;border-radius:22px;box-shadow:0 18px 44px rgba(0,0,0,.42);padding:14px;display:none;font-family:system-ui,sans-serif;font-weight:900}
      .falcon-dev-panel.show{display:block}
      .falcon-dev-panel h3{font-family:Impact,system-ui,sans-serif;letter-spacing:.04em;line-height:1;margin:0 0 8px;color:#fff}
      .falcon-dev-panel p{margin:0 0 10px;font-size:14px;line-height:1.35;color:#fff8d8}
      .falcon-dev-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
      .falcon-dev-grid button{background:#fff;color:#061b3d;border:2px solid #ffc83d;border-radius:14px;padding:9px;font-weight:900;cursor:pointer}
      .falcon-dev-grid button:hover{background:#ffc83d}
      .falcon-dev-output{margin-top:10px;background:#fff8d8;color:#061b3d;border-radius:14px;padding:9px;font-size:14px;line-height:1.35;min-height:38px;white-space:pre-wrap;max-height:130px;overflow:auto}
      .falcon-dev-close{position:absolute;right:10px;top:8px;background:transparent!important;color:white!important;border:0!important;font-size:20px;padding:2px 6px!important;cursor:pointer}
      @media(max-width:720px){.falcon-dev-panel{left:12px;right:12px;bottom:12px;width:auto}.falcon-dev-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    const page = detectPage();
    const panel = document.createElement("div");
    panel.className = "falcon-dev-panel";
    panel.id = "falconDevPanel";
    panel.setAttribute("aria-live","polite");
    panel.innerHTML = `
      <button class="falcon-dev-close" type="button" aria-label="Close dev panel">×</button>
      <h3>DEV MODE</h3>
      <p>Testing tools for ${page.name}. Type <strong>dev</strong> again to toggle.</p>
      <div class="falcon-dev-grid" id="falconDevButtons"></div>
      <div class="falcon-dev-output" id="falconDevOutput">Ready.</div>
    `;
    document.body.appendChild(panel);
    panel.querySelector(".falcon-dev-close").addEventListener("click", () => toggle(false));
    buildButtons();
  }
  function output(message){
    const box = document.getElementById("falconDevOutput");
    if(box) box.textContent = message;
  }
  function addButton(label, fn){
    const grid = document.getElementById("falconDevButtons");
    if(!grid) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      try {
        const result = fn && fn();
        output(result || `${label} done.`);
      } catch(err) {
        output(`Error: ${err.message || err}`);
      }
    });
    grid.appendChild(btn);
  }
  function buildButtons(){
    const grid = document.getElementById("falconDevButtons");
    if(!grid) return;
    grid.innerHTML = "";
    const page = detectPage();
    const custom = window.FalconDev || {};

    addButton("Complete Page", () => {
      if(custom.complete) return custom.complete();
      if(page.flag){ setFlag(page.flag, true); return `${page.name} marked complete.`; }
      return "No completion flag for this page.";
    });
    addButton("Complete All", () => {
      completeAllPaths();
      return "All main Falcon Camp paths marked complete.";
    });
    addButton("Reset Page", () => {
      if(custom.reset) return custom.reset();
      page.keys.forEach(k => localStorage.removeItem(k));
      if(page.flag) setFlag(page.flag, false);
      return `${page.name} save data reset.`;
    });
    addButton("Clear Camp Save", () => {
      localStorage.removeItem(SAVE_KEY);
      return "Falcon Camp save cleared.";
    });
    addButton("Show Storage", () => {
      const keys = Object.keys(localStorage).filter(k => /falcon|flight|field|storm|pizza|expedition/i.test(k)).sort();
      return keys.length ? keys.map(k => `${k}: ${localStorage.getItem(k)}`).join("\n") : "No Falcon Camp storage keys found.";
    });
    addButton("Camp Home", () => {
      location.href = "index.html";
      return "Opening camp home.";
    });

    if(Array.isArray(custom.actions)){
      custom.actions.forEach(action => addButton(action.label, action.run));
    }
  }
  function toggle(force){
    makePanel();
    const panel = document.getElementById("falconDevPanel");
    if(!panel) return;
    const next = typeof force === "boolean" ? force : !panel.classList.contains("show");
    panel.classList.toggle("show", next);
    if(next) {
      buildButtons();
      output("Ready.");
    }
  }

  document.addEventListener("keydown", event => {
    const tag = (event.target && event.target.tagName || "").toLowerCase();
    if(tag === "input" || tag === "textarea" || event.metaKey || event.ctrlKey || event.altKey) return;
    buffer = (buffer + event.key.toLowerCase()).slice(-TRIGGER.length);
    if(buffer === TRIGGER){
      event.preventDefault();
      toggle();
      buffer = "";
    }
  });

  window.FalconDevTools = { toggle, completeAllPaths, setFlag };
})();