/**
 * Badges, rewards, and motivation quotes – classroom-style encouragement.
 * Copyright-free: short, positive phrases.
 */

export const MOTIVATION_QUOTES = [
  "You are doing great! Keep going.",
  "Every try counts. Well done!",
  "Learning is fun. You're a star!",
  "Mistakes help us learn. Try again!",
  "You can do it. We believe in you!",
  "Great effort today!",
  "Keep trying. You're getting better!",
  "Super job! Be proud of yourself.",
  "One step at a time. You're doing it!",
  "Today you learned something new. Awesome!",
];

export function getRandomQuote() {
  return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
}

export const BADGES = {
  first_listening: { id: 'first_listening', label: 'First listener', emoji: '🎧' },
  first_speaking: { id: 'first_speaking', label: 'First speaker', emoji: '🗣️' },
  first_reading: { id: 'first_reading', label: 'First reader', emoji: '📖' },
  first_writing: { id: 'first_writing', label: 'First writer', emoji: '✏️' },
  star_5: { id: 'star_5', label: '5 in a row', emoji: '⭐' },
  star_10: { id: 'star_10', label: '10 correct', emoji: '🌟' },
  level_easy: { id: 'level_easy', label: 'Easy done', emoji: '✅' },
  level_medium: { id: 'level_medium', label: 'Medium done', emoji: '🏅' },
  level_hard: { id: 'level_hard', label: 'Hard done', emoji: '🏆' },
};

const BADGE_KEYS = Object.keys(BADGES);

export function getBadgeList(progress) {
  const badges = progress?.badges || [];
  return BADGE_KEYS.filter((k) => badges.includes(k)).map((k) => BADGES[k]);
}

export function unlockBadge(progress, badgeId) {
  const badges = progress?.badges || [];
  if (badges.includes(badgeId)) return progress;
  const nextBadges = [...badges, badgeId];
  try {
    const all = JSON.parse(localStorage.getItem('levelUpProgress') || '{}');
    if (!Array.isArray(all.badges)) all.badges = [];
    all.badges = [...new Set([...all.badges, badgeId])];
    localStorage.setItem('levelUpProgress', JSON.stringify(all));
  } catch (_) {}
  return { ...progress, badges: nextBadges };
}
