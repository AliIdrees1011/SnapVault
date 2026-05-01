// ═══════════════════════════════════════════
//  auth.js — SnapVault Authentication Helper
//  Depends on: config.js (API_URL)
// ═══════════════════════════════════════════

// ── Token storage ─────────────────────────
const TOKEN_KEY   = 'sv_token';
const ROLE_KEY    = 'sv_role';
const USER_KEY    = 'sv_username';
const USER_ID_KEY = 'sv_uid';

function getToken()    { return localStorage.getItem(TOKEN_KEY); }
function getRole()     { return localStorage.getItem(ROLE_KEY); }
function getUsername() { return localStorage.getItem(USER_KEY); }

function saveSession(token, role, username, userId) {
  localStorage.setItem(TOKEN_KEY,   token);
  localStorage.setItem(ROLE_KEY,    role);
  localStorage.setItem(USER_KEY,    username);
  localStorage.setItem(USER_ID_KEY, userId || '');
}

function clearSession() {
  [TOKEN_KEY, ROLE_KEY, USER_KEY, USER_ID_KEY].forEach(k => localStorage.removeItem(k));
}

// ── Auth header helpers ───────────────────
function jsonHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

function multipartHeaders() {
  return { 'Authorization': 'Bearer ' + getToken() };
}

// ── Route guard ───────────────────────────
function requireAuth(expectedRole) {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  if (expectedRole && getRole() !== expectedRole) {
    window.location.href = getRole() === 'creator' ? 'creator.html' : 'index.html';
    return false;
  }
  return true;
}

// ── Login ─────────────────────────────────
async function login(email, password) {
  const res  = await fetch(`${API_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  saveSession(data.access_token, data.role, data.username, data.user_id);
  return data;
}

// ── Register ──────────────────────────────
async function register(username, email, password) {
  const res  = await fetch(`${API_URL}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

// ── Logout ────────────────────────────────
function doLogout() {
  clearSession();
  window.location.href = 'login.html';
}

// ── Generic API call ─────────────────────
async function api(method, path, body = null) {
  const opts = { method, headers: jsonHeaders() };
  if (body) opts.body = JSON.stringify(body);

  let res, data;
  try {
    res  = await fetch(`${API_URL}${path}`, opts);
    data = await res.json();
  } catch {
    throw new Error('Cannot reach server. Is the backend running?');
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    return;
  }
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

// ── Toast ─────────────────────────────────
function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast');
  const span = document.getElementById('toast-msg');
  if (!wrap || !span) return;
  span.textContent = msg;
  wrap.className   = `toast ${type} show`;
  setTimeout(() => wrap.classList.remove('show'), 3500);
}

// ── Date helper ───────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
