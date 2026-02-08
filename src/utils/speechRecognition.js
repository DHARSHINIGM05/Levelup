/**
 * Web Speech API – speech recognition (hear and speak).
 * Returns a promise that resolves with the transcript or null if not supported/failed.
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
}

export function startSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return Promise.resolve(null);
  return new Promise((resolve) => {
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const transcript = (e.results[0] && e.results[0][0]) ? e.results[0][0].transcript : '';
      resolve(transcript.trim().toLowerCase());
    };
    rec.onerror = () => resolve(null);
    rec.onend = () => {};
    rec.start();
    setTimeout(() => {
      try { rec.stop(); } catch (_) {}
      resolve(null);
    }, 8000);
  });
}

/** Fuzzy match: expected and said may differ slightly (e.g. "cat" vs "cat.") */
export function matchSpoken(expected, said) {
  if (!said) return false;
  const e = (expected || '').trim().toLowerCase().replace(/[^\w\s]/g, '');
  const s = said.replace(/[^\w\s]/g, '');
  if (e === s) return true;
  if (s.includes(e) || e.includes(s)) return true;
  const eWords = e.split(/\s+/);
  const sWords = s.split(/\s+/);
  return eWords.some((w) => s.includes(w)) && s.length >= e.length * 0.5;
}
