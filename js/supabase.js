// ── SUPABASE CONFIG ───────────────────────────────────
const SUPABASE_URL = 'https://ownyjduxhwyhnnqpqkza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bnlqZHV4aHd5aG5ucXBxa3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDM0MTEsImV4cCI6MjA5NTg3OTQxMX0.PMFSl1v-bU_axuD0n0lmTKpOGudNPhzZ1hLuuxGa8rk';
const API          = `${SUPABASE_URL}/rest/v1/cards`;
const AUTH_URL     = `${SUPABASE_URL}/auth/v1`;

// ── AUTH STATE (MENGGUNAKAN LOCALSTORAGE AGAR ANTI-REFRESH) ──
let accessToken = localStorage.getItem('sql_admin_token') || null; 
let isAdmin = accessToken ? true : false;

// ── HEADERS ───────────────────────────────────────────
function getHeaders(write = false) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${write && accessToken ? accessToken : SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

// ── AUTH OPERATIONS ───────────────────────────────────
function openLoginModal() {
  if (isAdmin) return; 
  document.getElementById('login-modal').classList.add('show');
  
  // Matikan autocomplete secara paksa lewat JS agar tidak bocor ke input search #q
  const emailInput = document.getElementById('login-email');
  emailInput.setAttribute('autocomplete', 'new-password'); 
  
  setTimeout(() => emailInput.focus(), 100);
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('show');
  document.getElementById('login-err').style.display = 'none';
}

async function doLogin() {
  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-pass');
  const errEl = document.getElementById('login-err');
  const btn   = document.getElementById('login-btn');
  
  const email = emailEl.value.trim();
  const pass  = passEl.value;
  
  if (!email || !pass) { 
    showErr('Email dan password wajib diisi.'); 
    return; 
  }

  btn.textContent = 'Masuk...';
  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Login gagal');

    // Simpan token ke state dan localStorage browser
    accessToken = data.access_token;
    localStorage.setItem('sql_admin_token', accessToken);
    isAdmin = true;
    
    // Bersihkan form login agar tidak menempel di memori browser/search bar
    emailEl.value = '';
    passEl.value = '';

    // Bersihkan search bar utama dari sisa kelakuan autofill browser
    const searchInput = document.getElementById('q');
    if (searchInput) searchInput.value = ''; 

    closeLoginModal();
    setAdminUI(true);
    toast('Login berhasil! Selamat datang, admin.', 'ok');
    render();
  } catch(e) {
    showErr(e.message);
  } finally {
    btn.textContent = 'Masuk';
    btn.disabled = false;
  }
  
  function showErr(msg) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}

function adminLogout() {
  // Hapus token dari memori dan localStorage
  accessToken = null;
  localStorage.removeItem('sql_admin_token');
  isAdmin = false;
  
  setAdminUI(false);
  toast('Logout berhasil.', 'info');
  render();
}

function setAdminUI(on) {
  if (on) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }

  document.getElementById('admin-badge').style.display = on ? 'flex' : 'none';
  document.getElementById('btn-add-card').style.display = on ? 'flex' : 'none';
  
  const fab = document.getElementById('admin-fab');
  if (fab) {
    fab.innerHTML = on ? '<i class="ti ti-shield-check"></i>' : '<i class="ti ti-lock"></i>';
    fab.title = on ? 'Sudah login sebagai admin' : 'Admin login';
    fab.onclick = on ? adminLogout : openLoginModal;
    fab.style.opacity = on ? '0.9' : '0.4';
    
    if (on) {
      fab.style.background = 'var(--teal-bg)';
      fab.style.color = 'var(--teal-text)';
      fab.style.borderColor = '#7DC9AF';
    } else {
      fab.style.background = 'var(--bg2)';
      fab.style.color = 'var(--text3)';
      fab.style.borderColor = 'var(--border)';
    }
  }
}

// ── CRUD DATABASE OPERATIONS ──────────────────────────
async function dbFetch(){
  setLoading(true);
  
  // Fungsi penyeimbang: Cek status login saat halaman pertama kali dimuat/di-refresh
  setAdminUI(isAdmin);

  try {
    const res = await fetch(`${API}?order=id.asc`, { headers: getHeaders(false) });
    if(!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    if(rows.length > 0){
      CARDS.length = 0;
      rows.forEach(r => CARDS.push({
        _id: r.id, cat: r.cat, compat: r.compat, compat_tags: r.compat_tags || r.compat || 'mysql,pg', name: r.name,
        desc: r.description, tip: r.tip || '', code: r.code || '', detail: r.detail || ''
      }));
    } else {
      document.getElementById('seed-btn').style.display = 'flex';
    }
    render();
  } catch(e){
    toast('Gagal load database: ' + e.message, 'err');
    render();
  } finally { setLoading(false); }
}

async function dbInsert(card){
  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      cat: card.cat, compat: card.compat, compat_tags: card.compat_tags || card.compat, name: card.name,
      description: card.desc, tip: card.tip, code: card.code, detail: card.detail
    })
  });
  if(!res.ok) throw new Error(await res.text());
  return (await res.json())[0];
}

async function dbUpdate(id, card){
  const res = await fetch(`${API}?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({
      cat: card.cat, compat: card.compat, compat_tags: card.compat_tags || card.compat, name: card.name,
      description: card.desc, tip: card.tip, code: card.code, detail: card.detail
    })
  });
  if(!res.ok) throw new Error(await res.text());
}

async function dbDelete(id){
  const res = await fetch(`${API}?id=eq.${id}`, { method: 'DELETE', headers: getHeaders(true) });
  if(!res.ok) throw new Error(await res.text());
}

async function seedDB(){
  if(!isAdmin){ toast('Harus login dulu!', 'err'); return; }
  if(!confirm('Kirim semua data default ke database? Lakukan ini hanya sekali.')) return;
  setLoading(true);
  toast('Mengirim data...', 'info');
  try {
    for(const card of CARDS){
      const row = await dbInsert(card);
      card._id = row.id;
    }
    document.getElementById('seed-btn').style.display = 'none';
    toast('Berhasil seed ' + CARDS.length + ' kartu!', 'ok');
    render();
  } catch(e){
    toast('Gagal seed: ' + e.message, 'err');
  } finally { setLoading(false); }
}
