/**
 * Shared voice (TTS) and confirmation tone for GuideBot and inattentiveness alerts.
 */


let sharedAudioCtx = null;
function getAudioContext() {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  // Mobile browsers often suspend the context until a user gesture resumes it
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export function speak(text) {
  if (!text) return;
  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function playConfirmationTone() {
  try {
    const audioCtx = getAudioContext();   // ← use the shared one, not `new AudioContext()`
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.2;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.18);   // ← no more setTimeout, no more audioCtx.close()
  } catch (_) {}
}