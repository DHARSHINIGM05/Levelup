const KEY = 'levelUpProgress';

export function getProgress() {
  try {
    const s = localStorage.getItem(KEY);
    const p = s ? JSON.parse(s) : {};
    if (!Array.isArray(p.badges)) p.badges = [];
    return p;
  } catch {
    return { badges: [] };
  }
}

export function saveSessionProgress(module, difficulty, correctCount, total) {
  const p = getProgress();
  if (!p[module]) p[module] = { sessions: [], difficulty: 'easy' };
  p[module].sessions = (p[module].sessions || []).slice(-49);
  p[module].sessions.push({ difficulty, correctCount, total, at: Date.now() });
  p[module].lastScore = correctCount;
  p[module].lastTotal = total;
  p[module].difficulty = difficulty;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch (_) {}
}

export function getModuleDifficulty(module) {
  return getProgress()[module]?.difficulty || 'easy';
}

export function setModuleDifficulty(module, difficulty) {
  const p = getProgress();
  if (!p[module]) p[module] = { sessions: [] };
  p[module].difficulty = difficulty;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch (_) {}
}
