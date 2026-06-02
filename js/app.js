// ── UI HELPERS ────────────────────────────────────────
function toast(msg, type = 'info'){
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:64px;right:24px;z-index:9999;padding:10px 18px;border-radius:8px;font-size:13px;font-family:var(--font);box-shadow:0 4px 16px rgba(0,0,0,.15);transition:opacity .4s;background:${type==='ok'?'#EAF3DE':type==='err'?'#FCEBEB':'#E6F1FB'};color:${type==='ok'?'#27500A':type==='err'?'#791F1F':'#0C447C'};border:1px solid ${type==='ok'?'#97C459':type==='err'?'#E8A0A0':'#85B7EB'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
}

function setLoading(on){
  const el = document.getElementById('load-indicator');
  if(el) el.style.display = on ? 'flex' : 'none';
}

function esc(s){
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCompatBadges(tags) {
  if(!tags) return '';
  return tags.split(',').map(t => t.trim()).filter(t=>DB_LABELS[t]).map(t =>
    `<span class="badge ${DB_LABELS[t].cls}">${DB_LABELS[t].label}</span>`
  ).join('');
}

function colorCode(raw){
  const kws = [
    'CREATE TABLE','ALTER TABLE','DROP TABLE','TRUNCATE TABLE','CREATE INDEX','DROP INDEX',
    'INSERT INTO','ON DUPLICATE KEY UPDATE','ON CONFLICT','DO UPDATE SET','DO NOTHING',
    'UPDATE','DELETE FROM','DELETE','SELECT DISTINCT','SELECT','FROM','WHERE',
    'ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','FETCH FIRST','ROWS ONLY',
    'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN','CROSS JOIN','JOIN','ON',
    'UNION ALL','UNION','WITH','AS','CASE','WHEN','THEN','ELSE','END',
    'BEGIN','COMMIT','ROLLBACK','SAVEPOINT','PRIMARY KEY','FOREIGN KEY','REFERENCES',
    'AUTO_INCREMENT','SERIAL','NOT NULL','UNIQUE','DEFAULT','NULL',
    'IS NULL','IS NOT NULL','IN','NOT IN','EXISTS','NOT EXISTS','BETWEEN',
    'AND','OR','NOT','LIKE','ILIKE','ASC','DESC','NULLS LAST','NULLS FIRST',
    'PARTITION BY','OVER','RANK','DENSE_RANK','ROW_NUMBER','LAG','LEAD',
    'SUM','AVG','COUNT','MAX','MIN','ROUND','VALUES','SET',
    'ADD COLUMN','MODIFY COLUMN','DROP COLUMN','ALTER COLUMN',
    'IF EXISTS','IF NOT EXISTS','DISTINCT',
    'CREATE VIEW','CREATE OR REPLACE VIEW','DROP VIEW',
    'CONCAT_WS','CONCAT','COALESCE','IFNULL','NULLIF',
    'UPPER','LOWER','TRIM','LTRIM','RTRIM',
    'CHAR_LENGTH','LENGTH','SUBSTRING','SUBSTR','REPLACE',
    'GROUP_CONCAT','STRING_AGG','SEPARATOR','CURRENT_TIMESTAMP','EXCLUDED'
  ];
  
  let s = esc(raw);
  kws.sort((a,b) => b.length - a.length).forEach(k => {
    s = s.replace(new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), `<span class="kw">${k}</span>`);
  });
  s = s.replace(/'([^']*)'/g, `<span class="str">'$1'</span>`);
  s = s.replace(/\b(\d+(\.\d+)?)\b/g, `<span class="num">$1</span>`);
  s = s.replace(/--[^\n]*/g, m => `<span class="cmt">${m}</span>`);
  return s;
}

// ── RENDER CATEGORIES ─────────────────────────────────
const catsEl = document.getElementById('cats');
CATS.forEach(c => {
  const b = document.createElement('button');
  b.className = 'cat-btn' + (c === 'Semua' ? ' on' : '');
  b.textContent = c;
  b.onclick = () => {
    activeCatVal = c;
    document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    render();
  };
  catsEl.appendChild(b);
});

// ── EXPANDABLE PANEL ──────────────────────────────────
function toggleDetail(idx){
  const p = document.getElementById('dp-' + idx);
  const b = document.getElementById('db-' + idx);
  if(!p) return;
  p.classList.toggle('open');
  b.classList.toggle('open');
  b.querySelector('.lbl').textContent = p.classList.contains('open') ? 'Tutup detail' : 'Detail +';
}

// ── MAIN RENDER CORE ──────────────────────────────────
function render(){
  const q = (document.getElementById('q').value || '').toLowerCase();
  const filtered = CARDS.map((d, i) => ({d, i})).filter(({d}) => {
    const mc = activeCatVal === 'Semua' || d.cat === activeCatVal;
    const mq = !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || (d.tip || '').toLowerCase().includes(q);
    return mc && mq;
  });
  
  document.getElementById('cnt').textContent = filtered.length + ' query ditampilkan';

  document.getElementById('grid').innerHTML = filtered.map(({d, i}) => `
    <div class="card">
      <div class="card-edit-btn">
        <button onclick="openEditModal(${i})" title="Edit"><i class="ti ti-edit"></i></button>
        <button class="del-btn" onclick="deleteCardAt(${i})" title="Hapus"><i class="ti ti-trash"></i></button>
      </div>
      <div class="card-head">
        <div class="badges">
          <span class="badge ${badgeMap[d.cat] || 'b-adv'}">${esc(d.cat)}</span>
          ${renderCompatBadges(d.compat_tags || d.compat)}
        </div>
        <div class="card-title">${esc(d.name)}</div>
      </div>
      <div class="card-desc">${esc(d.desc)}</div>
      <div class="code-wrap"><div class="code-block">${colorCode(d.code)}</div></div>
      <div class="tip"><i class="ti ti-bulb"></i><span>${esc(d.tip)}</span></div>
      ${d.detail ? `
        <div class="divider"></div>
        <button class="expand-btn" id="db-${i}" onclick="toggleDetail(${i})">
          <i class="ti ti-chevron-down chevron"></i><span class="lbl">Detail +</span>
        </button>
        <div class="detail-panel" id="dp-${i}">
          <div class="detail-content">${esc(d.detail)}</div>
        </div>` : ''}
    </div>
  `).join('');
}

// ── ADD CARD MODAL INTERACTION ────────────────────────
function openAddModal(){
  if(!isAdmin){ toast('Harus login dulu!', 'err'); return; }
  document.getElementById('add-modal').classList.add('show');
}

function closeAddModal(){
  document.getElementById('add-modal').classList.remove('show');
  ['a-name', 'a-desc', 'a-code', 'a-tip', 'a-detail'].forEach(id => document.getElementById(id).value = '');
}

async function addCard(){
  if(!isAdmin){ toast('Harus login dulu!', 'err'); return; }
  const name = document.getElementById('a-name').value.trim();
  if(!name){ alert('Nama query wajib diisi!'); return; }
  
  const dbs = ['mysql','pg','db2','oracle','mssql'];
  const tags = dbs.filter(db => document.getElementById('a-c-' + db).checked).join(',');
  
  const card = {
    name, 
    cat: document.getElementById('a-cat').value,
    compat: tags,
    compat_tags: tags,
    desc: document.getElementById('a-desc').value,
    code: document.getElementById('a-code').value,
    tip: document.getElementById('a-tip').value,
    detail: document.getElementById('a-detail').value
  };

  try {
    setLoading(true);
    const row = await dbInsert(card);
    card._id = row.id;
    CARDS.push(card);
    closeAddModal(); 
    render();
    toast('Kartu ditambahkan!', 'ok');
  } catch(e){ 
    toast('Gagal simpan: ' + e.message, 'err'); 
  } finally { 
    setLoading(false); 
  }
}

// ── EDIT CARD MODAL INTERACTION ───────────────────────
let editingIdx = null;

function openEditModal(idx){
  if(!isAdmin) return;
  editingIdx = idx;
  const d = CARDS[idx];
  document.getElementById('e-idx').value = idx;
  document.getElementById('e-name').value = d.name || '';
  document.getElementById('e-cat').value = d.cat || 'DQL';
  
  const activeTags = (d.compat_tags || d.compat || 'mysql,pg').split(',');
  ['mysql','pg','db2','oracle','mssql'].forEach(db => {
    document.getElementById('e-c-' + db).checked = activeTags.includes(db);
  });
  
  document.getElementById('e-desc').value = d.desc || '';
  document.getElementById('e-code').value = d.code || '';
  document.getElementById('e-tip').value = d.tip || '';
  document.getElementById('e-detail').value = d.detail || '';
  document.getElementById('edit-modal').classList.add('show');
}

function closeEditModal(){
  document.getElementById('edit-modal').classList.remove('show');
  editingIdx = null;
}

async function saveEdit(){
  if(!isAdmin){ toast('Harus login dulu!', 'err'); return; }
  const idx = parseInt(document.getElementById('e-idx').value);
  const name = document.getElementById('e-name').value.trim();
  if(!name){ alert('Nama tidak boleh kosong!'); return; }

  const dbs = ['mysql','pg','db2','oracle','mssql'];
  const tags = dbs.filter(db => document.getElementById('e-c-' + db).checked).join(',');

  const card = {
    name, 
    cat: document.getElementById('e-cat').value,
    compat: tags,
    compat_tags: tags,
    desc: document.getElementById('e-desc').value,
    code: document.getElementById('e-code').value,
    tip: document.getElementById('e-tip').value,
    detail: document.getElementById('e-detail').value
  };

  try {
    setLoading(true);
    if(CARDS[idx]._id) await dbUpdate(CARDS[idx]._id, card);
    card._id = CARDS[idx]._id;
    CARDS[idx] = card;
    closeEditModal(); 
    render();
    toast('Perubahan disimpan!', 'ok');
  } catch(e){ 
    toast('Gagal update: ' + e.message, 'err'); 
  } finally { 
    setLoading(false); 
  }
}

async function deleteCard(){
  if(!isAdmin) return;
  if(!confirm('Hapus kartu ini?')) return;
  const idx = parseInt(document.getElementById('e-idx').value);
  try {
    setLoading(true);
    if(CARDS[idx]._id) await dbDelete(CARDS[idx]._id);
    CARDS.splice(idx, 1);
    closeEditModal(); 
    render();
    toast('Kartu dihapus.', 'ok');
  } catch(e){ 
    toast('Gagal hapus: ' + e.message, 'err'); 
  } finally { 
    setLoading(false); 
  }
}

async function deleteCardAt(idx){
  if(!isAdmin) return;
  if(!confirm('Hapus kartu "' + CARDS[idx].name + '"?')) return;
  try {
    setLoading(true);
    if(CARDS[idx]._id) await dbDelete(CARDS[idx]._id);
    CARDS.splice(idx, 1);
    render();
    toast('Kartu dihapus.', 'ok');
  } catch(e){ 
    toast('Gagal hapus: ' + e.message, 'err'); 
  } finally { 
    setLoading(false); 
  }
}

// ── APP INITIALIZATION ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  dbFetch();
});
