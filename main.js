/* ================= Twodsix Weapon SFX — main.js (no-wildcards) ================= */
const MOD_ID = "twodsix_mgt2e_weapon_sfx";

/* ---------- helpers ---------- */
const log = (...a) => console.log(`[${MOD_ID}]`, ...a);
const warn = (...a) => console.warn(`[${MOD_ID}]`, ...a);

function asArray(v) {
  try {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    if (typeof v === "object") {
      const keys = Object.keys(v);
      const numeric = keys.every(k => /^\d+$/.test(k));
      return (numeric ? keys.sort((a,b)=>Number(a)-Number(b)).map(k=>v[k]) : Object.values(v));
    }
  } catch {}
  return [];
}
function safeMerge(target, src) {
  return (foundry?.utils?.mergeObject ?? mergeObject)(target, src);
}
function dup(o){ return foundry?.utils?.duplicate ? foundry.utils.duplicate(o) : JSON.parse(JSON.stringify(o)); }

/* ---------- AudioHelper compat (removes v12+ deprecation) ---------- */
const AH = (foundry?.audio?.AudioHelper ?? globalThis.AudioHelper);

/* ---------- constants ---------- */
const VOL_UI_MAX = 4; // allow up to 400% behind the scenes, UI still shows 0–100%

/* ---------- CSS ---------- */
function addStyles() {
  if (document.getElementById(`${MOD_ID}-styles`)) return;
  const style = document.createElement("style");
  style.id = `${MOD_ID}-styles`;
  style.textContent = `
  #${MOD_ID}-groups .window-content{display:flex;flex-direction:column;padding:.5rem;height:100%;overflow-y:auto;box-sizing:border-box;}
  .${MOD_ID}-wrap{display:flex;flex-direction:column;gap:.6rem}
  .${MOD_ID}-toolbar{display:flex;gap:.5rem;align-items:center;flex-wrap:nowrap}
  .${MOD_ID}-toolbar .btn{height:28px;padding:0 .6rem;border:1px solid var(--color-border-dark,#444);border-radius:4px;background:rgba(255,255,255,.07);cursor:pointer;font-size:12px}
  .${MOD_ID}-toolbar .btn.icon{width:28px;padding:0}
  .${MOD_ID}-groups-list{display:flex;flex-direction:column;gap:.6rem}
  .${MOD_ID}-group{border:1px solid var(--color-border-dark,#444);border-radius:4px;background:rgba(0,0,0,.15)}
  .${MOD_ID}-header{display:flex;gap:.5rem;align-items:center;padding:.45rem .6rem;font-weight:600;cursor:pointer;background:rgba(255,255,255,.07);border-bottom:1px solid rgba(0,0,0,.25);border-radius:4px 4px 0 0}
  .${MOD_ID}-group.collapsed .${MOD_ID}-header{border-radius:4px}
  .${MOD_ID}-group-body{padding:.6rem .75rem .75rem}
  .${MOD_ID}-group.collapsed .${MOD_ID}-group-body{display:none}
  .${MOD_ID}-row{display:grid;grid-template-columns:180px 1fr auto;gap:.5rem;align-items:center;margin:.4rem 0}
  .${MOD_ID}-row textarea{grid-column:1/-1;min-height:90px;resize:vertical}
  .${MOD_ID}-subrow{grid-column:2 / -1;display:flex;gap:.5rem;align-items:center;margin-top:.25rem}
  .${MOD_ID}-subrow .value{opacity:.8;min-width:2.5rem;text-align:right}
  .${MOD_ID}-delete-btn{margin-top:.5rem;width:100%}
  input[type="range"].${MOD_ID}-vol{width:220px}
  `;
  document.head.appendChild(style);
}

/* ---------- App ---------- */
class SFXGroupsConfig extends FormApplication {
  static get defaultOptions() {
    return safeMerge(super.defaultOptions, {
      id: `${MOD_ID}-groups`,
      title: "Twodsix Weapon SFX — Groups",
      template: "modules/twodsix_mgt2e_weapon_sfx/templates/dummy.hbs",
      width: 900,
      height: 560,
      resizable: true,
      closeOnSubmit: false,
      submitOnChange: false
    });
  }

  get groups() {
    if (!this._groups) {
      try { this._groups = asArray(game.settings.get(MOD_ID, "groups")); }
      catch(e){ warn("Reading groups failed, resetting to []", e); this._groups = []; }
    }
    return this._groups;
  }

  _getCollapseState(){
    const set = new Set(), root = this.element?.[0];
    if (!root) return set;
    root.querySelectorAll(`section.${MOD_ID}-group`).forEach((sec,i)=>{
      if (sec.classList.contains("collapsed")) set.add(i);
    });
    return set;
  }

  async _renderInner() {
    addStyles();

    if (!this._collapsedSet) {
      const found = this._getCollapseState();
      this._collapsedSet = (found && found.size) ? found : new Set(this.groups.map((_,i)=>i)); // all collapsed by default
    }

    const wrap = document.createElement("div");
    wrap.className = `${MOD_ID}-wrap`;

    const bar = document.createElement("div");
    bar.className = `${MOD_ID}-toolbar`;
    bar.append(
      this._btn(`<i class="fas fa-plus"></i>`, "Expand all", () => this._expandAll(true), ["icon"]),
      this._btn(`<i class="fas fa-minus"></i>`, "Collapse all", () => this._expandAll(false), ["icon"]),
      this._btn(`<i class="fas fa-folder-plus"></i> Add`, "Add group", () => this._addGroup()),
      this._btn(`<i class="fas fa-save"></i> Save`, "Save changes", () => this._save(), ["primary"])
    );
    wrap.append(bar);

    const h = document.createElement("h3"); h.textContent = `Groups (${this.groups.length})`; wrap.append(h);

    const list = document.createElement("div");
    list.className = `${MOD_ID}-groups-list`;
    this.groups.forEach((g,i)=>list.append(this._renderGroup(g,i)));
    wrap.append(list);

    return $(wrap);
  }

  _renderGroup(g, idx){
    const sec = document.createElement("section");
    sec.className = `${MOD_ID}-group`;

    const header = document.createElement("div");
    header.className = `${MOD_ID}-header`;
    const caret = document.createElement("i"); caret.className = "fas fa-caret-right";
    const title = document.createElement("span"); title.textContent = g.name || "New Group";
    header.append(caret, title);
    header.addEventListener("click", ()=>{
      const willCollapse = !sec.classList.contains("collapsed");
      sec.classList.toggle("collapsed");
      caret.classList.toggle("fa-rotate-90", !willCollapse);
      if (willCollapse) this._collapsedSet.add(idx); else this._collapsedSet.delete(idx);
    });
    sec.append(header);

    const collapsedInitially = this._collapsedSet?.has(idx);
    if (collapsedInitially) sec.classList.add("collapsed");
    else caret.classList.add("fa-rotate-90");

    // defaults for new (or old saved) groups
    g.singleVol = parseFloat(g.singleVol ?? 0.8);
    g.burstVol  = parseFloat(g.burstVol  ?? 0.8);
    g.autoVol   = parseFloat(g.autoVol   ?? 0.8);

    const body = document.createElement("div");
    body.className = `${MOD_ID}-group-body`;

    body.append(this._textRow("Group Name", g.name ?? "", v=>{ g.name = v; title.textContent = v || "New Group"; }, `name-${idx}`, "name"));
    body.append(this._pathWithVolumeRow("Single", g.single ?? "", g.singleVol, v=> g.single = v, v=> g.singleVol = v, `single-${idx}`, "single", "singleVol"));
    body.append(this._pathWithVolumeRow("Burst",  g.burst  ?? "", g.burstVol,  v=> g.burst  = v, v=> g.burstVol  = v, `burst-${idx}`,  "burst",  "burstVol"));
    body.append(this._pathWithVolumeRow("Auto",   g.auto   ?? "", g.autoVol,   v=> g.auto   = v, v=> g.autoVol   = v, `auto-${idx}`,   "auto",   "autoVol"));
    body.append(this._textarea("Weapon Names (comma separated)", g.weapons ?? "", v=> g.weapons = v, `weapons-${idx}`, "weapons"));

    const del = document.createElement("button");
    del.type = "button";
    del.className = `btn ${MOD_ID}-delete-btn`;
    del.innerHTML = `<i class="fas fa-trash"></i> Delete`;
    del.title = "Delete this group";
    del.addEventListener("click", async ()=>{
      const ok = await Dialog.confirm({ title:"Delete Group", content:`<p>Delete “${g.name || "New Group"}”?</p>` });
      if (!ok) return;

      const before = this._getCollapseState();
      this.groups.splice(idx, 1);

      const remapped = new Set();
      before.forEach(i => { if (i !== idx) remapped.add(i > idx ? i - 1 : i); });
      this._collapsedSet = remapped;

      this.render(true);
    });
    body.append(del);

    sec.append(body);
    return sec;
  }

  _textRow(label, value, set, id, bind){
    const row = document.createElement("div"); row.className = `${MOD_ID}-row`;
    const l = document.createElement("label"); l.textContent = label;
    const i = document.createElement("input"); i.type="text"; i.id=id; i.dataset.bind=bind; i.value=value||"";
    i.addEventListener("input", ev=>set(ev.target.value));
    row.append(l,i,document.createElement("span"));
    return row;
  }

  _pathWithVolumeRow(label, value, volValue, setPath, setVol, idPrefix, bindPath, bindVol){
    // First line: path + picker
    const row = document.createElement("div"); row.className = `${MOD_ID}-row`;

    const l = document.createElement("label"); l.textContent = label;

    const i = document.createElement("input");
    i.type="text"; i.id=`${idPrefix}`; i.dataset.bind=bindPath; i.value=value||"";
    i.placeholder="path/to/file.ext"; // <— placeholder no longer suggests wildcards or random()
    i.addEventListener("input", ev=>setPath(ev.target.value));

    const pick = this._btn(`<i class="fas fa-folder-open"></i>`, "Pick file", ()=>this._pickFile(i), ["icon"]);

    // Second line: volume slider + live % value (UI 0–100%, internal 0–VOL_UI_MAX)
    const sub = document.createElement("div"); sub.className = `${MOD_ID}-subrow`;

    const vLabel = document.createElement("span"); vLabel.textContent = "Volume";

    const rng = document.createElement("input");
    rng.type = "range";
    rng.className = `${MOD_ID}-vol`;
    rng.min = "0"; rng.max = String(VOL_UI_MAX); rng.step = "0.01";
    const initialVol = (Number.isFinite(volValue) ? Math.max(0, Math.min(VOL_UI_MAX, volValue)) : 0.8);
    rng.value = String(initialVol);
    rng.dataset.bind = bindVol;

    const val = document.createElement("span");
    val.className = "value";
    const pct = v => `${Math.round(Math.min(1, Number(v)/VOL_UI_MAX)*100)}%`; // cap display at 100%
    val.textContent = pct(initialVol);

    rng.addEventListener("input", (ev)=>{
      const v = parseFloat(ev.target.value);
      val.textContent = pct(v); // show 0–100%
      setVol(v);               // store 0–VOL_UI_MAX
    });

    sub.append(vLabel, rng, val);

    row.append(l, i, pick, sub);
    return row;
  }

  _textarea(label, value, set, id, bind){
    const row = document.createElement("div"); row.className = `${MOD_ID}-row`;
    const l = document.createElement("label"); l.textContent = label;
    const t = document.createElement("textarea"); t.id=id; t.dataset.bind=bind; t.value=value||"";
    t.addEventListener("input", ev=>set(ev.target.value));
    row.append(l,t); return row;
  }

  async _pickFile(inputEl){
    try{
      const FPImpl = foundry?.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
      if (!FPImpl) throw new Error("FilePicker not available");
      const fp = new FPImpl({ type:"audio", current: inputEl.value || "sounds", callback:(p)=>{ inputEl.value=p; inputEl.dispatchEvent(new Event("input")); } });
      fp.render(true);
    }catch(e){ ui.notifications?.error("File Picker not available in this Foundry version."); warn("FilePicker error:", e); }
  }

  _btn(html,title,onClick,classes=[]){ const b=document.createElement("button"); b.type="button"; b.className=`btn ${classes.join(" ")}`.trim(); b.innerHTML=html; b.title=title; b.addEventListener("click",onClick); return b; }

  _expandAll(open){
    const secs=this.element.find(`section.${MOD_ID}-group`);
    secs[open?"removeClass":"addClass"]("collapsed");
    const carets=this.element.find(`.${MOD_ID}-header i`);
    carets[open?"addClass":"removeClass"]("fa-rotate-90");
    this._collapsedSet = new Set();
    if (!open) for (let i=0;i<secs.length;i++) this._collapsedSet.add(i);
  }

  _collectFromDOM(){
    const sections = Array.from(this.element[0].querySelectorAll(`section.${MOD_ID}-group`));
    const collected = sections.map(sec=>{
      const obj={};
      sec.querySelectorAll("[data-bind]").forEach(el=>{ obj[el.dataset.bind]=el.value; });
      return obj;
    });
    this._groups = collected;
  }

  async _save(){
    try{
      this._collectFromDOM();
      await game.settings.set(MOD_ID,"groups",dup(this.groups));
      buildMatcherCache();
      ui.notifications?.info("Weapon SFX groups saved.");
    }catch(e){ ui.notifications?.error("Failed to save groups—see console."); warn("Save failed:",e); }
  }

  _addGroup(){
    const prev = this._getCollapseState();
    this.groups.push({ name:"New Group", single:"", burst:"", auto:"", singleVol:0.8, burstVol:0.8, autoVol:0.8, weapons:"" });
    const newIdx = this.groups.length-1;
    this._collapsedSet = new Set([...prev, newIdx]); // keep all collapsed
    this.render(true);
  }

  async close(options={}){
    try{
      this._collectFromDOM();
      await game.settings.set(MOD_ID,"groups",dup(this.groups));
      buildMatcherCache();
    }catch(e){ warn("Auto-save on close failed:",e); }
    return super.close(options);
  }
}

/* ---------- register settings/menu ---------- */
Hooks.once("init", () => {
  try{
    game.settings.register(MOD_ID,"groups",{ scope:"world", config:false, type:Object, default:[] });
    game.settings.registerMenu(MOD_ID,"openGroups",{
      name:"Open Groups Manager",
      label:"Open Groups Manager",
      hint:"Open the window to create, edit, and manage SFX groups.",
      icon:"fas fa-folder-open",
      type:SFXGroupsConfig,
      restricted:true
    });
    log("registered settings + menu");
  }catch(e){ warn("init failed:",e); }
});

Hooks.once("ready", async () => {
  try{
    const v = asArray(game.settings.get(MOD_ID,"groups"));
    await game.settings.set(MOD_ID,"groups",v);
  }catch(e){ warn("sanitizing groups failed:",e); await game.settings.set(MOD_ID,"groups",[]); }

  buildMatcherCache();
  Hooks.on("createChatMessage", async (msg)=>await maybePlayWeaponSFX(msg));
  Hooks.on("updateSetting", s=>{
    try{
      const key = s?.key ?? s?.data?.key ?? s?.id;
      if (key === `${MOD_ID}.groups`) buildMatcherCache();
    }catch{}
  });
});

/* ---------- chat → SFX ---------- */
let _matcher = [];
const _cooldown = new Map(); // dedupe same actor/weapon/mode within window

function buildMatcherCache(){
  const norm = (v)=> {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(VOL_UI_MAX, n)) : 0.8; // allow up to 400%
  };
  const list = asArray(game.settings.get(MOD_ID,"groups"));
  _matcher = list.map(g=>{
    const names = String(g.weapons||"").split(",").map(s=>s.trim()).filter(Boolean);
    const regexes = names.map(n=>new RegExp(`\\b${escapeRegExp(n)}\\b`,"i"));
    return {
      title: g.name || "New Group",
      names,
      regexes,
      paths:{
        single:{ p:g.single||"", v:norm(g.singleVol) },
        burst :{ p:g.burst ||"", v:norm(g.burstVol)  },
        auto  :{ p:g.auto  ||"", v:norm(g.autoVol)   }
      }
    };
  }).filter(e=>e.names.length);
  log("matcher cache built", _matcher);
}
function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

function stripHTML(s){ const d=document.createElement("div"); d.innerHTML=s||""; return d.textContent||d.innerText||""; }

/* --- audio playback with boost (>100%) support --- */
let _audioCtx = null;
const _bufferCache = new Map();

async function playSound(path, volume=.8){
  if (!path) return;
  try{
    // Up to 100%—use Foundry/HTML audio as before (via namespaced AH)
    if (volume <= 1) {
      const data={src:path,volume,autoplay:true,loop:false};
      if (AH?.play) return AH.play(data, true);
      const a=new Audio(path); a.volume=volume; return a.play().catch(()=>{});
    }

    // >100%—use Web Audio gain node for clean amplification
    _audioCtx ??= (window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null));
    if (!_audioCtx) {
      // fallback if Web Audio unavailable: cap at 1
      const data={src:path,volume:1,autoplay:true,loop:false};
      if (AH?.play) return AH.play(data, true);
      const a=new Audio(path); a.volume=1; return a.play().catch(()=>{});
    }

    // cache decoded buffers per path
    let buf = _bufferCache.get(path);
    if (!buf) {
      const res = await fetch(path, {cache:"force-cache"});
      const arr = await res.arrayBuffer();
      buf = await _audioCtx.decodeAudioData(arr);
      _bufferCache.set(path, buf);
    }

    const src = _audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = _audioCtx.createGain();
    gain.gain.value = Math.min(VOL_UI_MAX, Math.max(0, volume)); // 0–VOL_UI_MAX
    src.connect(gain).connect(_audioCtx.destination);
    src.start(0);
  }catch(e){ warn("Audio play failed",e); }
}

/* ---------- path resolver (no wildcards) ---------- */
/** Accepts:
 *  - exact file: "sounds/pistol/shot_01.wav"
 *  (Wildcards like "*", "?", trailing "/" or "/*" are **not supported**.)
 *  (Optional: you can still implement `random(...)` if you decide to keep it.)
 */
async function resolveAudioPath(p) {
  if (!p) return p;

  // Explicitly refuse wildcards
  if (/[*?]/.test(p) || /\/$/.test(p) || /\/\*$/.test(p)) {
    warn(`Wildcard paths are disabled. Offending value: ${p}`);
    ui?.notifications?.warn?.("Weapon SFX: wildcard paths are disabled. Use exact files.");
    return null;
  }

  return p; // exact file only
}

/** Prefer explicit Twodsix flags for mode; then parse visible text like “Firing Mode (Auto)”. */
function detectMode(msg){
  const f = msg?.flags?.twodsix ?? {};

  const candidates = [
    f.fireMode, f.firingMode, f.attackType, f.mode
  ].filter(Boolean).map(String);

  for (const val of candidates){
    const s = val.toLowerCase().replace(/_/g, "-").trim();

    if (s === "auto-full" || /^(full[- ]?auto)$/.test(s)) return "auto";
    if (s === "auto-burst") return "burst";

    if (/burst/.test(s)) return "burst";
    if (/(auto[- ]?full|full[- ]?auto|auto|automatic)/.test(s)) return "auto";
    if (/(semi[- ]?auto|semi|single)/.test(s)) return "single";
  }

  const textRaw = `${stripHTML(msg?.flavor||"")} ${stripHTML(msg?.content||"")}`;
  const fm = /firing\s*mode\s*[:(]?\s*(single|semi(?:-?auto)?|burst|auto(?:matic)?|full[- ]?auto|auto[- ]?full|auto[- ]?burst)/i.exec(textRaw);
  if (fm){
    const s = fm[1].toLowerCase();
    if (s.includes("burst")) return "burst";
    if (s.includes("auto") && !s.includes("semi"))  return "auto";
    return "single";
  }

  const text = textRaw.toLowerCase();
  if (/\bburst(ed|s)?\b/.test(text) || /\b3[- ]round\b/.test(text)) return "burst";
  if (/\bfull[- ]?auto\b|\bauto(?:matic)?\b|\bauto[- ]?full\b/.test(text)) return "auto";

  return "single";
}

/** Resolve weapon name from flags (itemUUID) or content. */
async function resolveWeaponName(msg){
  const f = msg.flags?.twodsix ?? {};
  const byFlag = f.weaponName || f.itemName;
  if (byFlag) return String(byFlag);

  if (f.itemUUID && globalThis.fromUuid) {
    try {
      const doc = await fromUuid(f.itemUUID);
      const name = doc?.name ?? doc?.system?.name ?? null;
      if (name) return String(name);
    } catch(e){ /* ignore */ }
  }

  return null;
}

function passCooldown(key, ms=400){
  const now = Date.now();
  const last = _cooldown.get(key) || 0;
  if (now - last < ms) return false;
  _cooldown.set(key, now);
  return true;
}

async function maybePlayWeaponSFX(msg){
  try{
    if (!_matcher.length) return;

    // Only react to real attack messages to avoid double-fires (e.g., damage/other helper chat)
    const f = msg?.flags?.twodsix ?? {};
    if (f.rollClass && String(f.rollClass).toLowerCase() !== "attack") return;

    const text = `${stripHTML(msg.flavor||"")} ${stripHTML(msg.content||"")}`;
    const mode = detectMode(msg);

    const weaponName = await resolveWeaponName(msg);

    let entry = null;
    if (weaponName) {
      const wn = weaponName.toLowerCase();
      entry = _matcher.find(m => m.names.some(n => n.toLowerCase() === wn));
    }
    if (!entry) {
      entry = _matcher.find(m => m.regexes.some(rx => rx.test(text)));
    }
    if (!entry) return;

    // Debounce per actor/weapon/mode so we don't play twice for the same shot
    const key = `${f.actorUUID||""}|${f.itemUUID||weaponName||""}|${mode}`;
    if (!passCooldown(key, 450)) return;

    const spec = entry.paths[mode] || entry.paths.single;
    if (spec?.p) {
      const resolved = await resolveAudioPath(spec.p);
      if (resolved) await playSound(resolved, spec.v);
    }
  }catch(e){ warn("maybePlayWeaponSFX error", e); }
}
/* ========================================================== */
