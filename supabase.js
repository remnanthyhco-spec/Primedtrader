// PrimedTrader — Supabase Client
// Shared across all pages

const SUPABASE_URL = 'https://fjvsceetttikpmnigvcs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdnNjZWV0dHRpa3BtbmlndmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTM5MzMsImV4cCI6MjA5Mjk2OTkzM30.cPpBDGwMFrIkUL0yxKKeLaEAjoWdjXQUfGVlANlHosM';

// Initialize Supabase client
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH HELPERS ──────────────────────────────────────

// Sign up new user
async function sbSignUp(email, password, name) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  return { data, error };
}

// Sign in existing user
async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Sign out
async function sbSignOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

// Get current session
async function sbGetSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

// Get current user
async function sbGetUser() {
  const { data } = await sb.auth.getUser();
  return data.user;
}

// Verify OTP (2FA email code)
async function sbVerifyOTP(email, token) {
  const { data, error } = await sb.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  return { data, error };
}

// ── PROFILE HELPERS ───────────────────────────────────

// Get user profile
async function sbGetProfile(userId) {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

// Update user profile
async function sbUpdateProfile(userId, updates) {
  const { data, error } = await sb
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
}

// ── SESSION HELPERS ───────────────────────────────────

// Save a trading session
async function sbSaveSession(sessionData) {
  const user = await sbGetUser();
  if (!user) return { error: 'Not logged in' };
  const { data, error } = await sb
    .from('sessions')
    .insert({ ...sessionData, user_id: user.id });
  return { data, error };
}

// Get all sessions for current user
async function sbGetSessions(limit = 50) {
  const user = await sbGetUser();
  if (!user) return { data: [], error: null };
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// ── GUARD — redirect if not logged in ─────────────────
async function requireAuth(redirectTo = 'login.html') {
  const session = await sbGetSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

// ── GUARD — redirect if already logged in ─────────────
async function redirectIfLoggedIn(redirectTo = 'pro-dashboard.html') {
  const session = await sbGetSession();
  if (session) {
    window.location.href = redirectTo;
  }
}
