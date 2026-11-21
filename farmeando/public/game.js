// FARMEANDO CRINGE — combate de huachafería
// Desarrollado por MNRY · mantarraya.pe
(() => {
'use strict';
const W = 960, H = 540, GROUND = 446;
const cv = document.getElementById('cv');
const g = cv.getContext('2d');
const $ = id => document.getElementById(id);

// ---------- Configuración ----------
const SLOTS = ['acces.', 'camisa', 'saco', 'pantalón', 'zapatos'];
const SLOT_FULL = ['ACCESORIO', 'CAMISA', 'SACO', 'PANTALÓN', 'ZAPATOS'];
const STAGES = [
  { key: 'rusia', name: 'RUSIA', sub: 'Plaza Roja', win: 1250 },
  { key: 'casa', name: 'CASA DE LA LITERATURA', sub: 'Silencio, por favor', win: 1100 },
  { key: 'tauro', name: 'CINE TAURO', sub: 'Función de medianoche', win: 950 },
  { key: 'misa', name: 'LA MISA DEL PAPA', sub: 'Las Palmas · caos total', win: 850 },
];
const ROUND_TIME = 60;
const CHARS = {
  kunte: { name: 'VAGUEZ KUNTE', aura: '#ff3fd2', aura2: '#ffd1f4', accs: ['panama', 'pluma', 'gorra', 'gafasRosa', 'gafas'] },
  espa: { name: 'CAOS ESPÁ', aura: '#35c8ff', aura2: '#d4f4ff', accs: ['vaquero', 'aviador', 'redondos', 'gafas'] },
};
// Regiones del cuerpo en fracción de la altura del cuerpo base (desde la coronilla)
let META = null; // se carga de assets/meta.json

// ---------- Carga de assets ----------
const IMG = {};
function loadImg(k, src) { return new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = () => r(); i.src = src; }); }

// ---------- Audio (synthwave en vivo) ----------
let AC = null, master = null, musicOn = true, musicTimer = null, sfxMute = false;
function audioInit() {
  if (AC) return;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.5; master.connect(AC.destination); } catch (e) { AC = null; }
}
function tone(f, t, d, type = 'square', v = 0.15, f2 = null) {
  if (!AC || sfxMute) return;
  const o = AC.createOscillator(), gn = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(gn); gn.connect(master); o.start(t); o.stop(t + d + 0.02);
}
function noise(t, d, v = 0.2) {
  if (!AC || sfxMute) return;
  const b = AC.createBuffer(1, AC.sampleRate * d, AC.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const s = AC.createBufferSource(), gn = AC.createGain(); s.buffer = b;
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(gn); gn.connect(master); s.start(t);
}
const SFX = {
  zap() { const t = AC && AC.currentTime; tone(1400, t, 0.12, 'sawtooth', 0.12, 300); },
  steal() { const t = AC && AC.currentTime; [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.04, 0.09, 'square', 0.08)); },
  hit() { const t = AC && AC.currentTime; noise(t, 0.15, 0.25); tone(160, t, 0.15, 'square', 0.15, 60); },
  wrong() { const t = AC && AC.currentTime; tone(110, t, 0.25, 'sawtooth', 0.15, 80); },
  block() { const t = AC && AC.currentTime; tone(880, t, 0.08, 'triangle', 0.15); tone(1320, t + 0.05, 0.1, 'triangle', 0.12); },
  flex() { const t = AC && AC.currentTime; [262, 330, 392, 523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.06, 0.25, 'sawtooth', 0.09)); },
  ko() { const t = AC && AC.currentTime; tone(400, t, 0.9, 'sawtooth', 0.18, 50); noise(t, 0.6, 0.2); },
  water() { const t = AC && AC.currentTime; noise(t, 0.5, 0.25); },
  blip() { const t = AC && AC.currentTime; tone(660, t, 0.06, 'square', 0.08); },
};
// Loop synthwave: Am - F - C - G
const PROG = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
let step = 0, nextNoteT = 0;
function musicTick() {
  if (!AC || !musicOn) return;
  const spb = 60 / 112 / 2; // corcheas a 112 bpm
  while (nextNoteT < AC.currentTime + 0.2) {
    const bar = Math.floor(step / 8) % 4, chord = PROG[bar], s = step % 8;
    const tt = nextNoteT;
    const bass = AC.createOscillator(), bg = AC.createGain();
    bass.type = 'sawtooth'; bass.frequency.value = mtof(chord[0] - 12 + (s % 2 ? 12 : 0));
    bg.gain.setValueAtTime(0.07, tt); bg.gain.exponentialRampToValueAtTime(0.001, tt + spb * 0.9);
    bass.connect(bg); bg.connect(master); bass.start(tt); bass.stop(tt + spb);
    const arp = AC.createOscillator(), ag = AC.createGain();
    arp.type = 'square'; arp.frequency.value = mtof(chord[1 + (s % 3)] + 12);
    ag.gain.setValueAtTime(0.025, tt); ag.gain.exponentialRampToValueAtTime(0.001, tt + spb * 0.7);
    arp.connect(ag); ag.connect(master); arp.start(tt); arp.stop(tt + spb);
    if (s % 4 === 0) { const k = AC.createOscillator(), kg = AC.createGain(); k.frequency.setValueAtTime(140, tt); k.frequency.exponentialRampToValueAtTime(40, tt + 0.15); kg.gain.setValueAtTime(0.35, tt); kg.gain.exponentialRampToValueAtTime(0.001, tt + 0.18); k.connect(kg); kg.connect(master); k.start(tt); k.stop(tt + 0.2); }
    if (s % 4 === 2) { const b = AC.createBuffer(1, AC.sampleRate * 0.12, AC.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length); const sn = AC.createBufferSource(), sg = AC.createGain(); sn.buffer = b; sg.gain.value = 0.12; sn.connect(sg); sg.connect(master); sn.start(tt); }
    nextNoteT += spb; step++;
  }
}
function musicStart() { playMusic(curMusic || 'title'); }
// Música y locutor (archivos)
const MUS = {}, ANN = {};
let curMusic = null;
['title', 'rusia', 'casa', 'tauro', 'misa'].forEach(k => { const a = new Audio('assets/audio/m_' + k + '.mp3'); a.loop = true; a.preload = 'none'; a.volume = 0.45; MUS[k] = a; });
['1', '2', '3', '4', '5', 'bonus'].forEach(k => { const a = new Audio('assets/audio/a_' + k + '.mp3'); a.preload = 'auto'; a.volume = 1; ANN[k] = a; });
function playMusic(k) {
  if (curMusic === k && MUS[k] && !MUS[k].paused) return;
  Object.entries(MUS).forEach(([kk, a]) => { if (kk !== k) { a.pause(); } });
  curMusic = k;
  if (!musicOn || !userStarted) return;
  const a = MUS[k]; if (!a) return; a.currentTime = 0; a.play().catch(() => { });
}
function announce(k) { if (!musicOn || !userStarted) return; const a = ANN[k]; if (!a) return; try { a.currentTime = 0; a.play().catch(() => { }); } catch (_) { } }
let userStarted = false;

// ---------- Composición de vestuario ----------
// Una prenda: {src:'kunte'|'espa', look:1..4} o {gafas:true}
function frameRect(look) { return [look * META.fw, 0, META.fw, META.fh]; }
function regY(c, f) { return META[c].top + f * META[c].h; }
function makeComposite(f) {
  const c = f.char, M = META;
  const cvs = f.cvs || (f.cvs = document.createElement('canvas'));
  cvs.width = M.fw; cvs.height = M.fh;
  const x = cvs.getContext('2d'); x.clearRect(0, 0, M.fw, M.fh);
  x.drawImage(IMG[c], 0, 0, M.fw, M.fh, 0, 0, M.fw, M.fh);
  const R = M.reg;
  const band = (slot, y0f, y1f, srcFull) => {
    const p = f.slots[slot]; if (!p) return;
    const y0 = Math.round(regY(c, y0f)), y1 = y1f >= 9 ? M.fh : Math.round(regY(c, y1f));
    const sy0 = Math.round(regY(p.src, y0f)), sy1 = y1f >= 9 ? M.fh : Math.round(regY(p.src, y1f));
    x.clearRect(0, y0, M.fw, y1 - y0);
    x.drawImage(IMG[p.src], p.look * M.fw, sy0, M.fw, sy1 - sy0, 0, y0, M.fw, y1 - y0);
  };
  band(3, R.legs[0], R.legs[1]);
  band(4, R.feet[0], 99);
  band(2, R.torso[0], R.torso[1]);
  // camisa: franja central del torso
  const sh = f.slots[1];
  if (sh) {
    const y0 = Math.round(regY(c, R.shirt[0])), y1 = Math.round(regY(c, R.shirt[1]));
    const sy0 = Math.round(regY(sh.src, R.shirt[0])), sy1 = Math.round(regY(sh.src, R.shirt[1]));
    const sx = Math.round(M[sh.src].cx * M.fw - R.shirtW * M[sh.src].h), dx = Math.round(M[c].cx * M.fw - R.shirtW * M[c].h), sw = Math.round(R.shirtW * 2 * M[c].h);
    x.clearRect(dx, y0, sw, y1 - y0);
    x.drawImage(IMG[sh.src], sh.look * M.fw + sx, sy0, sw, sy1 - sy0, dx, y0, sw, y1 - y0);
  }
  const ac = f.slots[0];
  if (ac) drawAcc(x, ac.acc, M[c].hx * M.fw, M[c].top, M[c].h);
  f.dirty = false;
}
// Accesorios dibujados en pixel art (calzan en cualquier cabeza)
const hatDrop = { panama: 3.2, pluma: 3.2, gorra: 3.4, vaquero: 3.6 };
function drawAcc(x, kind, hx, top, h) {
  const u = h / 100, R = (a, b, w, hh, col) => { x.fillStyle = col; x.fillRect(Math.round(hx + a * u), Math.round(top + (b + (hatDrop[kind] || 0)) * u), Math.round(w * u), Math.round(hh * u)); };
  const ey = 8.6, ex = 1.2;
  const glasses = (frame, lens, round) => {
    if (round) { x.strokeStyle = frame; x.lineWidth = u * 0.6; x.beginPath(); x.arc(hx + (ex - 2.4) * u, top + ey * u, 1.9 * u, 0, 6.3); x.stroke(); x.beginPath(); x.arc(hx + (ex + 2.4) * u, top + ey * u, 1.9 * u, 0, 6.3); x.stroke(); R(ex - 0.6, ey - 0.3, 1.2, 0.5, frame); return; }
    R(ex - 1.2, ey - 1.1, 2.4, 0.6, frame);
    R(ex - 5.6, ey - 1.5, 4.6, 3.2, frame); R(ex + 1, ey - 1.5, 4.6, 3.2, frame);
    R(ex - 5.1, ey - 1, 3.6, 2.2, lens); R(ex + 1.5, ey - 1, 3.6, 2.2, lens);
    R(ex - 4.7, ey - 0.8, 1.1, 0.7, 'rgba(255,255,255,.8)'); R(ex + 1.9, ey - 0.8, 1.1, 0.7, 'rgba(255,255,255,.8)');
  };
  const panama = () => {
    R(-5.2, -4.2, 10.4, 6.4, '#000'); R(-4.6, -3.7, 9.2, 5.6, '#efe3c2'); R(-4.6, -3.7, 9.2, 1, '#fff7df');
    R(-4.6, 0, 9.2, 1.4, '#1a1a1a');
    R(-10.6, 1.6, 21.2, 2.2, '#000'); R(-10, 2, 20, 1.4, '#e6d6ad'); R(-10, 2, 20, 0.5, '#fff3d0');
  };
  if (kind === 'panama') panama();
  else if (kind === 'pluma') {
    panama();
    x.save(); x.translate(hx - 4 * u, top + 0.2 * u); x.rotate(-0.7);
    for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#ffd400' : '#ffb000'; x.fillRect(-1.2 * u + i * 0.2 * u, -9 * u + i * 1.2 * u, (2.6 + i * 0.4) * u, 1.3 * u); }
    x.restore();
  } else if (kind === 'gorra') {
    R(-6.4, -4.6, 12.8, 6.2, '#000'); R(-5.8, -4, 11.6, 5, '#141414'); R(-5.8, -0.4, 11.6, 1.3, '#d6a52a');
    R(-1.4, -3.4, 2.8, 2.8, '#ffcf3a'); R(-0.7, -2.7, 1.4, 1.4, '#a36d00');
    R(-2, 1.4, 10.5, 1.4, '#000'); R(-1.6, 1.6, 9.8, 0.8, '#333');
  } else if (kind === 'vaquero') {
    R(-5.4, -6.2, 10.8, 7.6, '#000'); R(-4.8, -5.6, 9.6, 6.6, '#f1ead6'); R(-1, -5.6, 2, 1.6, '#cfc4a6');
    R(-4.8, -0.4, 9.6, 1.2, '#8a5a2b');
    R(-12.6, 1, 25.2, 2.4, '#000'); R(-12, 1.4, 24, 1.4, '#e9e0c6');
    R(-13.4, -1, 2.4, 3, '#000'); R(-12.8, -0.6, 1.6, 2.2, '#e9e0c6'); R(11, -1, 2.4, 3, '#000'); R(11.2, -0.6, 1.6, 2.2, '#e9e0c6');
  } else if (kind === 'gafas') glasses('#111', '#3a2a4a');
  else if (kind === 'gafasRosa') glasses('#ff3fd2', '#ff9fe6');
  else if (kind === 'aviador') glasses('#e8b923', '#6b3d12');
  else if (kind === 'redondos') glasses('#d4a017', null, true);
}
// Imagen suelta de una prenda (para que vuele por la pantalla)
function garmentImage(p, slot) {
  const M = META, c = document.createElement('canvas');
  if (slot === 0) { const h = META.kunte.h; c.width = 90; c.height = 70; drawAcc(c.getContext('2d'), p.acc, 45, 30, h); return c; }
  const R = M.reg, s = p.src;
  let y0, y1, x0 = 0, w = M.fw;
  if (slot === 0) { y0 = 0; y1 = regY(s, R.hat); }
  else if (slot === 1) { y0 = regY(s, R.shirt[0]); y1 = regY(s, R.shirt[1]); x0 = M[s].cx * M.fw - R.shirtW * M[s].h; w = R.shirtW * 2 * M[s].h; }
  else if (slot === 2) { y0 = regY(s, R.torso[0]); y1 = regY(s, R.torso[1]); }
  else if (slot === 3) { y0 = regY(s, R.legs[0]); y1 = regY(s, R.legs[1]); }
  else { y0 = regY(s, R.feet[0]); y1 = M.fh; }
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(y1 - y0));
  c.getContext('2d').drawImage(IMG[s], p.look * M.fw + x0, y0, w, y1 - y0, 0, 0, c.width, c.height);
  return c;
}

// ---------- Estado ----------
let state = 'loading', T = 0, last = 0;
let pick = 'kunte', stageIdx = 0, score = 0, runStart = 0, runSecs = 0, topList = [], nameErr = '';
let P, R, pend, fx = [], parts = [], msgs = [], combo = 0, sup = 0, stun = 0, nextAt = 0, roundT0 = 0, timeLeft = ROUND_TIME, shake = 0, flash = 0, flashCol = '#fff';
let hz = {}; // peligros del escenario
let result = null, stateT = 0, stats = { hits: 0, perf: 0 };

function newFighter(c, side) {
  return { char: c, side, x: side < 0 ? 290 : 670, hp: 100, slots: [null, null, null, null, null], dirty: true, cvs: null, lunge: 0, hurt: 0, glow: 0, ko: false, koT: 0, win: false, defend: -1 };
}
function other(c) { return c === 'kunte' ? 'espa' : 'kunte'; }
const SC = () => 300 / META.kunte.h; // escala de dibujo
function slotY(f, slot) {
  const R = META.reg, M = META[f.char];
  const fr = [R.hat - 0.04, (R.shirt[0] + R.shirt[1]) / 2, R.torso[0] + 0.1, (R.legs[0] + R.legs[1]) / 2, R.feet[0] + 0.035][slot];
  return GROUND - (META.fh - (M.top + fr * M.h)) * SC();
}

function startRun() {
  score = 0; stageIdx = 0; runStart = performance.now(); stats = { hits: 0, perf: 0 };
  startStage();
}
function startStage() {
  P = newFighter(pick, -1); R = newFighter(other(pick), 1);
  pend = null; fx = []; parts = []; msgs = []; combo = 0; sup = 0; stun = 0; shake = 0; flash = 0;
  timeLeft = ROUND_TIME; hz = { t: 0, next: 6 + Math.random() * 3 };
  setState('intro');
  showFlex(false);
  playMusic(STAGES[stageIdx].key);
  setTimeout(() => announce(String(stageIdx + 1)), 350);
}
function setState(s) { state = s; stateT = 0; updateUI(); }

function say(text, col = '#ffd400', big = false) { msgs.push({ text, col, t: 0, big }); if (msgs.length > 3) msgs.shift(); }

// ---------- Lógica del combate ----------
function spawn() {
  const st = STAGES[stageIdx];
  const el = ROUND_TIME - timeLeft;
  const win = Math.max(560, st.win - el * 6);
  const myGarments = P.slots.map((p, i) => p ? i : -1).filter(i => i >= 0);
  if (myGarments.length && Math.random() < 0.3) {
    const slot = myGarments[Math.floor(Math.random() * myGarments.length)];
    pend = { type: 'robo', slot, t: 0, win: win + 150 };
    P.defend = slot; SFX.blip();
    return;
  }
  const slot = Math.floor(Math.random() * 5);
  const c = R.char;
  let piece;
  if (slot === 0) {
    const accs = CHARS[c].accs;
    piece = { acc: accs[Math.floor(Math.random() * accs.length)] };
  } else piece = { src: c, look: 1 + Math.floor(Math.random() * 4) };
  R.slots[slot] = piece; R.dirty = true; R.glow = 1;
  pend = { type: 'estreno', slot, t: 0, win, piece };
  SFX.blip();
}
function press(i) {
  audioInit();
  if (state !== 'fight') return;
  if (T < stun) return;
  if (!pend) return;
  if (pend.type === 'estreno') {
    if (i === pend.slot) {
      const q = pend.t, p = pend.piece, slot = i; pend = null;
      const perfect = q < 380;
      combo++; stats.hits++; if (perfect) stats.perf++;
      const mult = Math.min(4, 1 + Math.floor(combo / 4));
      const pts = (perfect ? 150 : q < 750 ? 100 : 60) * mult;
      score += pts;
      say((perfect ? '¡PERFECTO!' : q < 750 ? '¡BIEN!' : 'AL TOQUE') + (mult > 1 ? ' x' + mult : ''), perfect ? '#7cff6b' : '#ffd400');
      P.lunge = 1; SFX.zap();
      ray(P, R, slot, CHARS[P.char].aura, () => {
        R.slots[slot] = null; R.dirty = true; R.hurt = 1; R.hp = Math.max(0, R.hp - (perfect ? 9 : 7));
        burst(R.x, slotY(R, slot), CHARS[P.char].aura); SFX.hit();
        flyGarment(p, slot, R, P, () => { P.slots[slot] = p; P.dirty = true; SFX.steal(); });
      });
      sup = Math.min(100, sup + 12); if (sup >= 100) showFlex(true);
      nextAt = T + 0.32 + Math.random() * 0.45;
    } else miss(i);
  } else if (pend.type === 'robo') {
    if (i === pend.slot) {
      pend = null; P.defend = -1; combo++;
      score += 80 * Math.min(4, 1 + Math.floor(combo / 4));
      say('¡DEFENDIDO!', '#7cf6ff'); SFX.block();
      fx.push({ k: 'shield', x: P.x, y: slotY(P, i), t: 0, d: 0.35, col: CHARS[P.char].aura });
      sup = Math.min(100, sup + 6); if (sup >= 100) showFlex(true);
      nextAt = T + 0.3 + Math.random() * 0.4;
    } else miss(i);
  }
}
function miss(i) {
  stun = T + 0.45; combo = 0; SFX.wrong();
  say('NORMALIZADO', '#aaaaaa');
  P.lunge = 1;
  ray(P, R, i, '#777', null, true);
  P.hp = Math.max(0, P.hp - 4); P.hurt = 0.6;
}
function timeout() {
  const p = pend; pend = null; combo = 0;
  const slot = p.slot;
  R.lunge = 1; SFX.zap();
  if (p.type === 'estreno') {
    say('¡TE DIO!', '#ff4d6d');
    ray(R, P, slot, CHARS[R.char].aura, () => {
      P.hp = Math.max(0, P.hp - 9); P.hurt = 1; shake = 0.3; SFX.hit(); burst(P.x, slotY(P, slot), CHARS[R.char].aura);
      const mine = P.slots[slot];
      if (mine) { P.slots[slot] = null; P.dirty = true; flyGarment(mine, slot, P, R, () => { }); }
    });
  } else {
    P.defend = -1;
    say('¡TE ROBÓ!', '#ff4d6d');
    ray(R, P, slot, CHARS[R.char].aura, () => {
      P.hp = Math.max(0, P.hp - 7); P.hurt = 1; shake = 0.25; SFX.hit();
      const mine = P.slots[slot];
      if (mine) { P.slots[slot] = null; P.dirty = true; flyGarment(mine, slot, P, R, () => { R.slots[slot] = mine; R.dirty = true; }); }
    });
  }
  nextAt = T + 0.45 + Math.random() * 0.4;
}
function doFlex() {
  if (state !== 'fight' || sup < 100) return;
  sup = 0; showFlex(false); SFX.flex();
  flash = 1; flashCol = CHARS[P.char].aura;
  fx.push({ k: 'flex', t: 0, d: 1.2 });
  score += 1500;
  say('¡FLEX HUACHAFO!', '#ffd400', true);
  announce('bonus');
  setTimeout(() => { if (R) { R.hp = Math.max(0, R.hp - 25); R.hurt = 1; shake = 0.5; SFX.hit(); } }, 500);
}
function ray(from, to, slot, col, done, missed = false) {
  const y0 = slotY(from, slot), y1 = slotY(to, slot);
  const x0 = from.x + (from.side < 0 ? 70 : -70), x1 = to.x + (missed ? (to.side > 0 ? 220 : -220) : 0);
  fx.push({ k: 'ray', x0, y0, x1, y1: missed ? y1 - 140 : y1, col, t: 0, d: 0.12, done });
}
function burst(x, y, col) { for (let i = 0; i < 16; i++) { const a = Math.random() * 6.28, s = 120 + Math.random() * 260; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.5, t: 0, col, sz: 3 + Math.random() * 4 }); } }
function flyGarment(p, slot, from, to, done) {
  const img = garmentImage(p, slot);
  fx.push({ k: 'fly', img, x0: from.x, y0: slotY(from, slot), x1: to.x, y1: slotY(to, slot), t: 0, d: 0.28, done, flip: from.side > 0 });
}
function showFlex(v) { $('flex').style.display = v ? 'block' : 'none'; }

// ---------- Peligros por escenario ----------
function hazardsUpdate(dt) {
  const k = STAGES[stageIdx].key; hz.t += dt;
  if (k === 'rusia') {
    if (Math.random() < dt * 60) parts.push({ x: Math.random() * W, y: -10, vx: -30 + Math.random() * 20, vy: 60 + Math.random() * 80, life: 9, t: 0, col: '#fff', sz: 2 + Math.random() * 3, snow: 1 });
    if (hz.t > hz.next) { hz.blizz = 2.2; hz.side = Math.random() < 0.5 ? -1 : 1; hz.next = hz.t + 7 + Math.random() * 4; say('¡VENTISCA!', '#ffffff'); }
    if (hz.blizz > 0) hz.blizz -= dt;
  } else if (k === 'tauro') {
    if (hz.t > hz.next) { hz.dark = 2.6; hz.next = hz.t + 6 + Math.random() * 4; say('¡SE FUE LA LUZ!', '#ff3fd2'); }
    if (hz.dark > 0) hz.dark -= dt;
  } else if (k === 'misa') {
    if (hz.t > hz.next) {
      hz.next = hz.t + 8 + Math.random() * 4;
      if (Math.random() < 0.5) {
        hz.water = 1; SFX.water(); say('¡BALDAZO DE AGUA!', '#7cf6ff');
        [P, R].forEach(f => { const has = f.slots.map((p, i) => p ? i : -1).filter(i => i >= 0); if (has.length) { const s = has[Math.floor(Math.random() * has.length)]; const pc = f.slots[s]; f.slots[s] = null; f.dirty = true; fx.push({ k: 'drop', img: garmentImage(pc, s), x: f.x, y: slotY(f, s), t: 0, d: 0.8 }); } });
      } else { hz.glitch = 3; say('¡SE CAYERON LAS PANTALLAS!', '#ff4d6d'); }
    }
    if (hz.water > 0) hz.water -= dt * 1.5;
    if (hz.glitch > 0) hz.glitch -= dt;
    if (Math.random() < dt * 0.8) hz.crowd = hz.crowd || [], hz.crowd.push({ x: Math.random() < 0.5 ? -60 : W + 60, dir: 0, h: 70 + Math.random() * 40, sp: 140 + Math.random() * 120 });
    if (hz.crowd) hz.crowd.forEach(c => { if (!c.dir) c.dir = c.x < 0 ? 1 : -1; c.x += c.dir * c.sp * dt; });
    if (hz.crowd) hz.crowd = hz.crowd.filter(c => c.x > -80 && c.x < W + 80);
    if (Math.random() < dt * 0.5) fx.push({ k: 'rosary', x: Math.random() < 0.5 ? -30 : W + 30, y: 120 + Math.random() * 120, t: 0, d: 2.2, vy: -80 });
  }
}

// ---------- Bucle ----------
function update(dt) {
  T += dt; stateT += dt;
  if (state === 'intro') { if (stateT > 2.4) { setState('fight'); nextAt = T + 0.8; } }
  if (state === 'fight') {
    timeLeft = Math.max(0, timeLeft - dt);
    hazardsUpdate(dt);
    if (pend) { pend.t += dt * 1000; if (pend.t > pend.win) timeout(); }
    else if (T >= nextAt) spawn();
    if (P.hp <= 0 || R.hp <= 0 || timeLeft <= 0) endRound();
  }
  if (state === 'ko' && stateT > 3.2) afterKO();
  [P, R].forEach(f => { if (!f) return; f.lunge = Math.max(0, f.lunge - dt * 5); f.hurt = Math.max(0, f.hurt - dt * 3); f.glow = Math.max(0, f.glow - dt * 1.2); });
  shake = Math.max(0, shake - dt); flash = Math.max(0, flash - dt * 2);
  fx = fx.filter(e => { e.t += dt; if (e.t >= e.d) { if (e.done) e.done(); return false; } return true; });
  parts = parts.filter(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (!p.snow) p.vy += 500 * dt; return p.t < p.life && p.y < H + 20; });
  msgs = msgs.filter(m => (m.t += dt) < 1.1);
}
function endRound() {
  pend = null; P.defend = -1; showFlex(false);
  const won = P.hp > R.hp || (P.hp === R.hp && P.hp > 0);
  result = won;
  const loser = won ? R : P, winner = won ? P : R;
  loser.ko = true; winner.win = true;
  // al perdedor se le vuela toda la ropa
  loser.slots.forEach((p, i) => { if (p) fx.push({ k: 'drop', img: garmentImage(p, i), x: loser.x, y: slotY(loser, i), t: 0, d: 1, up: 1 }); });
  loser.slots = [null, null, null, null, null]; loser.dirty = true;
  SFX.ko(); flash = 1; flashCol = '#fff'; shake = 0.6;
  if (won) score += P.hp * 20 + 1000;
  setState('ko');
}
function afterKO() {
  if (result && stageIdx < STAGES.length - 1) { stageIdx++; startStage(); }
  else { runSecs = (performance.now() - runStart) / 1000; setState('name'); playMusic('title'); }
}

// ---------- Dibujo ----------
function drawFighter(f) {
  if (!f) return;
  const s = SC();
  if (f.ko || (f.win && state === 'ko')) {
    const img = IMG[f.char + (f.ko ? '_ko' : '_win')];
    if (img) {
      const h = 300 * (f.ko ? 1 : 1.0), w = img.width * h / img.height;
      g.save(); g.translate(f.x, GROUND); if (f.side > 0) g.scale(-1, 1);
      if (f.ko) g.rotate(Math.min(0.25, stateT * 0.4) * -1);
      g.drawImage(img, -w / 2, -h, w, h); g.restore(); return;
    }
  }
  if (f.dirty || !f.cvs) makeComposite(f);
  const w = META.fw * s, h = META.fh * s;
  const lx = (f.side < 0 ? 1 : -1) * f.lunge * 26 + (f.hurt ? (Math.random() - 0.5) * 10 * f.hurt : 0);
  const bob = Math.sin(T * 4 + (f.side > 0 ? 1 : 0)) * 3;
  g.save();
  g.translate(f.x + lx, GROUND + bob * 0.3);
  if (f.side > 0) g.scale(-1, 1);
  const cxOff = (META[f.char].cx - 0.5) * w;
  // sombra
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, -4, 70, 12, 0, 0, 6.3); g.fill();
  // aura cuando estrena
  const aura = f === R && pend && pend.type === 'estreno' ? 1 : f.glow;
  if (aura > 0 || (f === P && sup >= 100)) {
    g.globalCompositeOperation = 'lighter';
    const col = CHARS[f.char].aura;
    for (let k = 0; k < 3; k++) { g.globalAlpha = 0.18 * (aura || 0.7); g.drawImage(f.cvs, -w / 2 - cxOff - 6 + k * 6 + Math.sin(T * 30 + k) * 3, -h - 4, w, h + 4); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  g.drawImage(f.cvs, -w / 2 - cxOff, -h + bob, w, h);
  if (f.hurt > 0.5) { g.globalCompositeOperation = 'source-atop'; }
  g.restore();
  if (f.hurt > 0) { g.save(); g.globalAlpha = f.hurt * 0.5; g.globalCompositeOperation = 'lighter'; g.translate(f.x + lx, GROUND); if (f.side > 0) g.scale(-1, 1); g.drawImage(f.cvs, -w / 2 - cxOff, -h, w, h); g.restore(); }
}
function drawSlotFlash(f, slot, col, label) {
  const y = slotY(f, slot), on = Math.floor(T * 12) % 2 === 0;
  g.save();
  g.strokeStyle = on ? '#fff' : col; g.lineWidth = 4;
  const rw = slot === 1 ? 46 : slot === 0 ? 60 : 96, rh = slot === 2 ? 110 : slot === 3 ? 100 : slot === 1 ? 70 : 34;
  g.strokeRect(f.x - rw / 2 + (META[f.char].cx - 0.5) * 0, y - rh / 2, rw, rh);
  if (label) {
    g.font = '14px "Press Start 2P", monospace'; g.textAlign = 'center';
    const lx = f.x + (f.side > 0 ? -120 : 120);
    g.fillStyle = '#000'; g.fillRect(lx - 70, y - 18, 140, 30);
    g.fillStyle = on ? col : '#fff'; g.fillText(label, lx, y + 4);
  }
  g.restore();
}
function txt(t, x, y, size, col = '#fff', align = 'center', stroke = 6) {
  g.font = size + 'px "Press Start 2P", monospace'; g.textAlign = align; g.lineJoin = 'round';
  g.lineWidth = stroke; g.strokeStyle = '#000'; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
}
function drawBG(key, dim = 0) {
  const img = IMG['bg_' + key];
  if (img) { const sc = Math.max(W / img.width, H / img.height); const w = img.width * sc, h = img.height * sc; g.drawImage(img, (W - w) / 2, H - h, w, h); }
  else { g.fillStyle = '#1b0f33'; g.fillRect(0, 0, W, H); }
  if (dim) { g.fillStyle = `rgba(10,0,25,${dim})`; g.fillRect(0, 0, W, H); }
}
function drawHUD() {
  const glitch = hz.glitch > 0 && Math.random() < 0.6;
  if (glitch) { g.fillStyle = '#000'; g.fillRect(0, 0, W, 70); for (let i = 0; i < 20; i++) { g.fillStyle = ['#f00', '#0f0', '#00f', '#fff', '#ff0'][i % 5]; g.fillRect(Math.random() * W, Math.random() * 70, 40 + Math.random() * 100, 3); } return; }
  const bar = (x, w, hp, right) => {
    g.fillStyle = '#000'; g.fillRect(x - 3, 15, w + 6, 26);
    g.fillStyle = '#b3001b'; g.fillRect(x, 18, w, 20);
    g.fillStyle = hp > 30 ? '#ffd400' : '#ff7a00';
    const ww = w * hp / 100; g.fillRect(right ? x : x + w - ww, 18, ww, 20);
  };
  bar(30, 360, P.hp, false); bar(W - 390, 360, R.hp, true);
  txt(CHARS[P.char].name, 30, 62, 14, '#fff', 'left', 4);
  txt(CHARS[R.char].name, W - 30, 62, 14, '#fff', 'right', 4);
  g.fillStyle = '#000'; g.fillRect(W / 2 - 42, 8, 84, 52);
  txt(String(Math.ceil(timeLeft)), W / 2, 50, 30, timeLeft < 10 ? '#ff4d6d' : '#fff', 'center', 4);
  txt('PUNTOS ' + score, 30, 92, 12, '#7cf6ff', 'left', 4);
  txt(STAGES[stageIdx].name, W - 30, 92, 12, '#ffd400', 'right', 4);
  // súper
  g.fillStyle = '#000'; g.fillRect(W / 2 - 152, 70, 304, 16);
  g.fillStyle = sup >= 100 && Math.floor(T * 8) % 2 ? '#fff' : '#b14bff'; g.fillRect(W / 2 - 150, 72, 300 * sup / 100, 12);
  txt('SÚPER', W / 2, 104, 10, '#d7b5ff', 'center', 3);
  if (combo >= 4) txt('COMBO ' + combo, 30, 118, 12, '#7cff6b', 'left', 4);
}
function render() {
  g.save();
  if (shake > 0) g.translate((Math.random() - 0.5) * 16 * shake, (Math.random() - 0.5) * 16 * shake);
  if (state === 'loading') { g.fillStyle = '#12061f'; g.fillRect(0, 0, W, H); txt('CARGANDO HUACHAFERÍA...', W / 2, H / 2, 18, '#ff3fd2'); g.restore(); return; }
  if (state === 'title') return drawTitle(), g.restore();
  if (state === 'select') return drawSelect(), g.restore();
  if (state === 'name' || state === 'top') { drawBG('misa', 0.75); g.restore(); return; }
  const st = STAGES[stageIdx];
  drawBG(st.key);
  // multitud de la misa
  if (hz.crowd) hz.crowd.forEach(c => { g.fillStyle = 'rgba(20,10,30,0.85)'; g.fillRect(c.x - 18, GROUND + 20 - c.h, 36, c.h); g.beginPath(); g.arc(c.x, GROUND + 14 - c.h, 14, 0, 6.3); g.fill(); });
  drawFighter(P); drawFighter(R);
  if (state === 'fight' && pend) {
    const showLabel = st.key !== 'casa' && stageIdx < 3 ? SLOT_FULL[pend.slot] : (st.key === 'casa' ? '' : SLOT_FULL[pend.slot]);
    if (pend.type === 'estreno') drawSlotFlash(R, pend.slot, CHARS[R.char].aura, showLabel ? '¡' + showLabel + '!' : '');
    else drawSlotFlash(P, pend.slot, '#ff4d6d', '¡DEFIENDE ' + SLOT_FULL[pend.slot] + '!');
  }
  // efectos
  fx.forEach(e => {
    const p = e.t / e.d;
    if (e.k === 'ray') {
      const xe = e.x0 + (e.x1 - e.x0) * p, ye = e.y0 + (e.y1 - e.y0) * p;
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      g.strokeStyle = e.col; g.lineWidth = 22; g.globalAlpha = 0.45; g.beginPath(); g.moveTo(e.x0, e.y0); g.lineTo(xe, ye); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 7; g.globalAlpha = 1; g.beginPath(); g.moveTo(e.x0, e.y0); g.lineTo(xe, ye); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(xe, ye, 14, 0, 6.3); g.fill(); g.restore();
    } else if (e.k === 'fly') {
      const x = e.x0 + (e.x1 - e.x0) * p, y = e.y0 + (e.y1 - e.y0) * p - Math.sin(Math.PI * p) * 110;
      const s = SC(); g.save(); g.translate(x, y); g.rotate(p * 9 * (e.x1 > e.x0 ? 1 : -1)); if (e.flip) g.scale(-1, 1);
      g.drawImage(e.img, -e.img.width * s / 2, -e.img.height * s / 2, e.img.width * s, e.img.height * s); g.restore();
    } else if (e.k === 'drop') {
      const s = SC(); g.save(); g.globalAlpha = 1 - p; g.translate(e.x + (e.up ? (Math.random() - 0.5) * 4 + p * 200 * (e.x > W / 2 ? 1 : -1) : 0), e.y + (e.up ? -p * 260 + p * p * 400 : p * p * 260)); g.rotate(p * 4);
      g.drawImage(e.img, -e.img.width * s / 2, -e.img.height * s / 2, e.img.width * s, e.img.height * s); g.restore();
    } else if (e.k === 'shield') {
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = e.col; g.lineWidth = 8; g.globalAlpha = 1 - p;
      g.beginPath(); g.arc(e.x + 60, e.y, 40 + p * 40, -1.2, 1.2); g.stroke(); g.restore();
    } else if (e.k === 'flex') {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + T * 2; g.strokeStyle = i % 2 ? CHARS[P.char].aura : '#ffd400'; g.globalAlpha = (1 - p) * 0.6; g.lineWidth = 14; g.beginPath(); g.moveTo(P.x, GROUND - 160); g.lineTo(P.x + Math.cos(a) * 900, GROUND - 160 + Math.sin(a) * 900); g.stroke(); }
      g.restore();
    } else if (e.k === 'rosary') {
      const x = e.x < W / 2 ? -30 + p * (W + 60) : W + 30 - p * (W + 60), y = e.y + Math.sin(p * 9) * 30;
      g.save(); g.translate(x, y); g.rotate(p * 12); g.strokeStyle = '#d9b26a'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 16, 0, 6.3); g.stroke(); g.fillStyle = '#d9b26a'; g.fillRect(-2, 14, 4, 14); g.fillRect(-7, 20, 14, 4); g.restore();
    }
  });
  parts.forEach(p => { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.col; g.fillRect(p.x, p.y, p.sz, p.sz); }); g.globalAlpha = 1;
  // peligros de pantalla
  if (hz.blizz > 0) { g.fillStyle = 'rgba(235,245,255,0.82)'; const a = Math.min(1, hz.blizz); g.globalAlpha = a; g.fillRect(hz.side < 0 ? 0 : W / 2, 0, W / 2, H); g.globalAlpha = 1; }
  if (hz.dark > 0) { const lit = Math.floor(T * 7) % 3 === 0; g.fillStyle = lit ? 'rgba(80,0,50,0.35)' : 'rgba(0,0,0,0.94)'; g.fillRect(0, 0, W, H); }
  if (hz.water > 0) { g.fillStyle = `rgba(90,180,255,${hz.water * 0.45})`; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,240,255,0.8)'; g.fillRect(Math.random() * W, Math.random() * H, 3, 18); } }
  if (flash > 0) { g.globalAlpha = flash * 0.7; g.fillStyle = flashCol; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  if (state === 'fight' && T < stun) { g.fillStyle = 'rgba(90,90,100,0.35)'; g.fillRect(0, 0, W, H); }
  drawHUD();
  // mensajes
  msgs.forEach((m, i) => { const y = 200 + i * 44 - m.t * 30; g.globalAlpha = Math.min(1, 2 - m.t * 1.8); txt(m.text, W / 2, y, m.big ? 34 : 22, m.col); g.globalAlpha = 1; });
  if (state === 'intro') {
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, 170, W, 170);
    if (stateT < 1.6) { txt('ESCENARIO ' + (stageIdx + 1) + ' DE 4', W / 2, 215, 16, '#7cf6ff'); txt(st.name, W / 2, 268, st.name.length > 16 ? 28 : 40, '#ffd400'); txt(st.sub, W / 2, 310, 14, '#fff'); }
    else txt('¡A FARMEAR!', W / 2, 280, 48, '#ff3fd2');
  }
  if (state === 'ko') {
    txt(result ? '¡HUACHAFO!' : '¡TE DEJARON EN SHORT!', W / 2, 250, result ? 58 : 30, result ? '#ffd400' : '#ff4d6d', 'center', 8);
    if (stateT > 1.2) txt(result ? (stageIdx < 3 ? 'SIGUIENTE ESCENARIO...' : '¡GANASTE LA MISA!') : 'FIN DEL JUEGO', W / 2, 310, 18, '#fff');
  }
  g.restore();
}
function drawTitle() {
  drawBG('misa', 0.55);
  // personajes
  const kk = IMG.kunte_win, ee = IMG.espa_win;
  if (ee) { const h = 330, w = ee.width * h / ee.height; g.drawImage(ee, 90, H - h - 20, w, h); }
  if (kk) { const h = 330, w = kk.width * h / kk.height; g.save(); g.translate(W - 90, H - h - 20); g.scale(-1, 1); g.drawImage(kk, 0, 0, w, h); g.restore(); }
  const t = T;
  g.save(); g.translate(W / 2, 150); g.rotate(Math.sin(t * 2) * 0.02);
  txt('FARMEANDO', 0, -20, 54, '#ff3fd2', 'center', 10);
  txt('CRINGE', 0, 50, 66, '#ffd400', 'center', 10);
  g.restore();
  txt('Combate de huachafería', W / 2, 232, 14, '#fff', 'center', 4);
  if (Math.floor(t * 2) % 2 === 0) txt('TOCA PARA JUGAR', W / 2, 330, 20, '#7cf6ff');
  txt('Desarrollado por MNRY · mantarraya.pe', W / 2, H - 34, 10, '#ccc', 'center', 3);
  txt('Creado y licenciado por MR', W / 2, H - 14, 9, '#999', 'center', 3);
}
function drawSelect() {
  drawBG('rusia', 0.6);
  txt('ELIGE A TU VIEJO', W / 2, 70, 28, '#ffd400');
  ['espa', 'kunte'].forEach((c, i) => {
    const x = i ? W * 0.72 : W * 0.28, sel = pick === c;
    const f = SEL[c]; if (f.dirty || !f.cvs) makeComposite(f);
    const s = 280 / META[c].h, w = META.fw * s, h = META.fh * s;
    g.save(); g.translate(x, 450); if (i) g.scale(-1, 1);
    if (sel) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; for (let k = -1; k <= 1; k++) g.drawImage(f.cvs, -w / 2 - (META[c].cx - 0.5) * w + k * 6, -h - 4, w, h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    g.drawImage(f.cvs, -w / 2 - (META[c].cx - 0.5) * w, -h + (sel ? Math.sin(T * 6) * 4 : 0), w, h); g.restore();
    txt(CHARS[c].name, x, 490, 18, sel ? CHARS[c].aura : '#fff');
  });
  txt('Toca un personaje', W / 2, 525, 12, '#ccc', 'center', 3);
}
const SEL = {};

// ---------- UI (DOM) ----------
function updateUI() {
  $('pad').style.display = state === 'fight' || state === 'intro' ? 'grid' : 'none';
  $('namebox').style.display = state === 'name' ? 'flex' : 'none';
  $('topbox').style.display = state === 'top' ? 'flex' : 'none';
  const menu = state === 'title' || state === 'select' || state === 'top' || state === 'name';
  $('mute').style.display = menu ? 'block' : 'none'; $('toptitle').style.display = state === 'title' || state === 'select' ? 'block' : 'none';
  if (state === 'name') {
    $('finalscore').textContent = score.toLocaleString('es-PE');
    $('finalmsg').textContent = result && stageIdx === 3 ? '¡Sobreviviste a la Misa del Papa!' : 'Llegaste hasta: ' + STAGES[stageIdx].name;
    $('nameerr').textContent = '';
    setTimeout(() => $('nm').focus(), 100);
  }
}
async function loadTop() {
  try { const r = await fetch('/api/top'); topList = await r.json(); } catch (e) { topList = []; }
  renderTop();
}
let myEntry = null;
function renderTop() {
  const ol = $('toplist'); ol.innerHTML = '';
  if (!topList.length) { ol.innerHTML = '<li class="empty">Nadie ha farmeado todavía. ¡Sé el primero!</li>'; return; }
  topList.forEach((r, i) => {
    const li = document.createElement('li');
    if (myEntry && r.name === myEntry.name && r.score === myEntry.score) li.className = 'me';
    li.innerHTML = `<span class="pos">${i + 1}</span><span class="nm"></span><span class="who">${r.fighter === 'kunte' ? 'Kunte' : 'Espá'}</span><span class="sc">${Number(r.score).toLocaleString('es-PE')}</span>`;
    li.querySelector('.nm').textContent = r.name;
    ol.appendChild(li);
  });
}
async function submitName(e) {
  e && e.preventDefault();
  const name = $('nm').value.trim();
  if (!name) { $('nameerr').textContent = 'Escribe tu nombre primero'; return; }
  $('send').disabled = true;
  try {
    const r = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, score, fighter: pick, stage: stageIdx + 1, dur: runSecs }) });
    const d = await r.json();
    if (!r.ok) { $('nameerr').textContent = d.error || 'No se pudo guardar'; $('send').disabled = false; return; }
    myEntry = { name: name.slice(0, 12), score };
    topList = d.top; renderTop();
    try { localStorage.setItem('fc_name', name); } catch (_) { }
    setState('top');
  } catch (err) { $('nameerr').textContent = 'Sin conexión. Intenta de nuevo.'; }
  $('send').disabled = false;
}
function shareWA() {
  const url = location.origin;
  const t = `Hice ${score.toLocaleString('es-PE')} puntos de cringe en FARMEANDO CRINGE 🕺 ¿Me ganas? ${url}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank');
}

// ---------- Entrada ----------
function canvasPoint(ev) { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; }
cv.addEventListener('pointerdown', ev => {
  audioInit(); if (AC && AC.state === 'suspended') AC.resume(); if (!userStarted) { userStarted = true; musicStart(); }
  if (state === 'title') { setState('select'); SFX.blip(); return; }
  if (state === 'select') {
    const p = canvasPoint(ev);
    const c = p.x < W / 2 ? 'espa' : 'kunte';
    if (pick === c && p.y > 100) { SFX.flex(); startRun(); } else { pick = c; SFX.blip(); }
    return;
  }
});
document.querySelectorAll('#pad button').forEach(b => b.addEventListener('pointerdown', ev => { ev.preventDefault(); press(+b.dataset.s); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); }));
$('flex').addEventListener('pointerdown', ev => { ev.preventDefault(); doFlex(); });
const KEYS = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, a: 0, s: 1, d: 2, f: 3, g: 4 };
document.addEventListener('keydown', ev => {
  if (state === 'name') return;
  const k = ev.key.toLowerCase();
  if (k in KEYS) { press(KEYS[k]); const b = document.querySelector(`#pad button[data-s="${KEYS[k]}"]`); if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); } }
  if (k === ' ' || k === 'enter') { ev.preventDefault(); if (state === 'fight') doFlex(); else if (state === 'title') { audioInit(); if (!userStarted) { userStarted = true; musicStart(); } setState('select'); } else if (state === 'select') startRun(); }
  if (k === 'arrowleft' && state === 'select') pick = 'espa';
  if (k === 'arrowright' && state === 'select') pick = 'kunte';
});
$('namebox').addEventListener('submit', submitName);
$('again').addEventListener('click', () => { myEntry = null; setState('select'); playMusic('title'); });
$('share').addEventListener('click', shareWA);
$('mute').addEventListener('click', () => { musicOn = !musicOn; sfxMute = !musicOn; $('mute').textContent = musicOn ? '♪ ON' : '♪ OFF'; if (master) master.gain.value = musicOn ? 0.5 : 0; if (musicOn) { userStarted = true; const k = curMusic; curMusic = null; playMusic(k || 'title'); } else Object.values(MUS).forEach(a => a.pause()); });
$('toptitle').addEventListener('click', () => { loadTop(); setState('top'); });

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const s = Math.min(vw / W, vh / H);
  const wrap = $('wrap'); wrap.style.width = W * s + 'px'; wrap.style.height = H * s + 'px';
  wrap.style.setProperty('--s', s);
  $('rotate').style.display = vh > vw * 1.1 ? 'flex' : 'none';
}
window.addEventListener('resize', fit);

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
  update(dt); render();
  requestAnimationFrame(loop);
}

(async function boot() {
  fit(); requestAnimationFrame(loop);
  try { META = await (await fetch('assets/meta.json')).json(); } catch (e) { }
  await Promise.all([
    loadImg('kunte', 'assets/kunte.png'), loadImg('espa', 'assets/espa.png'),
    loadImg('kunte_ko', 'assets/kunte_ko.png'), loadImg('espa_ko', 'assets/espa_ko.png'),
    loadImg('kunte_win', 'assets/kunte_win.png'), loadImg('espa_win', 'assets/espa_win.png'),
    ...STAGES.map(s => loadImg('bg_' + s.key, 'assets/bg_' + s.key + '.jpg')),
    document.fonts ? document.fonts.load('20px "Press Start 2P"') : null,
  ]);
  window.__fc = { ko: () => { if (R) R.hp = 0; }, lose: () => { if (P) P.hp = 0; } };
  SEL.kunte = newFighter('kunte', 1); SEL.espa = newFighter('espa', -1);
  try { const n = localStorage.getItem('fc_name'); if (n) $('nm').value = n; } catch (_) { }
  setState('title');
  loadTop();
})();
})();
