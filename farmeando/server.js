// Farmeando Cringe — servidor del juego y del top ten
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false })
  : null;

const memScores = [];
async function init() {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, score INTEGER NOT NULL,
    fighter TEXT, stage INTEGER, created_at TIMESTAMPTZ DEFAULT now())`);
  await pool.query('ALTER TABLE scores ADD COLUMN IF NOT EXISTS token TEXT');
}

const BAD = ['puta','puto','mierda','verga','pinga','cojud','conchatu','csm','ctm','maric','cabro','huevon','webon','imbecil','idiota','nazi','culo','pene','vagina','sexo','chuch'];
function cleanName(n) {
  n = String(n || '').normalize('NFC').replace(/[^\p{L}\p{N} ._\-!¡?¿]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 12);
  const flat = n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  if (!n || BAD.some(b => flat.includes(b))) return null;
  return n;
}

const lastPost = new Map();
async function top() {
  if (!pool) return memScores.slice().sort((a, b) => b.score - a.score).slice(0, 10).map(({ name, score, fighter, stage }) => ({ name, score, fighter, stage }));
  const r = await pool.query('SELECT name, score, fighter, stage FROM scores ORDER BY score DESC, created_at ASC LIMIT 10');
  return r.rows;
}

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }); return res.end(); }
    if (url.pathname === '/api/top' && req.method === 'GET') return send(res, 200, await top());
    if (url.pathname === '/api/score' && req.method === 'POST') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const now = Date.now();
      if (now - (lastPost.get(ip) || 0) < 8000) return send(res, 429, { error: 'Espera un momento' });
      let body = '';
      for await (const c of req) { body += c; if (body.length > 2000) break; }
      let d; try { d = JSON.parse(body); } catch { return send(res, 400, { error: 'Datos inválidos' }); }
      const name = cleanName(d.name);
      if (!name) return send(res, 400, { error: 'Ese nombre no va. Prueba otro.' });
      const score = Math.floor(Number(d.score));
      const dur = Number(d.dur);
      const stage = Math.max(1, Math.min(4, Math.floor(Number(d.stage)) || 1));
      const fighter = d.fighter === 'kunte' ? 'kunte' : 'espa';
      // Puntaje imposible: tope por etapa y por segundo jugado
      if (!Number.isFinite(score) || score < 0 || score > 120000 * stage || !Number.isFinite(dur) || dur < 10 || score > dur * 2500 + 5000 * stage)
        return send(res, 400, { error: 'Puntaje no válido' });
      lastPost.set(ip, now);
      // Nivel secreto: el total reemplaza al puntaje que el mismo jugador guardó antes (se prueba con su id + token).
      const repId = Math.floor(Number(d.replaceId)), repTok = typeof d.replaceToken === 'string' ? d.replaceToken.slice(0, 64) : '';
      if (repId > 0 && repTok) {
        if (pool) {
          const u = await pool.query('UPDATE scores SET name=$1, score=$2, fighter=$3, stage=$4 WHERE id=$5 AND token=$6 AND score <= $2 RETURNING id', [name, score, fighter, stage, repId, repTok]);
          if (u.rowCount) return send(res, 200, { ok: true, id: repId, token: repTok, top: await top() });
        } else {
          const m = memScores.find(x => x.id === repId && x.token === repTok && x.score <= score);
          if (m) { Object.assign(m, { name, score, fighter, stage }); return send(res, 200, { ok: true, id: repId, token: repTok, top: await top() }); }
        }
      }
      const token = crypto.randomBytes(12).toString('hex');
      let id;
      if (pool) id = (await pool.query('INSERT INTO scores (name, score, fighter, stage, token) VALUES ($1,$2,$3,$4,$5) RETURNING id', [name, score, fighter, stage, token])).rows[0].id;
      else { id = memScores.length + 1; memScores.push({ id, name, score, fighter, stage, token }); }
      return send(res, 200, { ok: true, id, token, top: await top() });
    }
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    const file = path.normalize(path.join(PUB, p));
    if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('No encontrado'); }
      const ext = path.extname(file);
      res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': (ext === '.html' || ext === '.js' || ext === '.json') ? 'no-cache' : 'public, max-age=86400' });
      res.end(data);
    });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Error del servidor' });
  }
});

init().catch(e => console.error('DB init', e)).finally(() => server.listen(PORT, () => console.log('Farmeando Cringe en puerto ' + PORT)));
