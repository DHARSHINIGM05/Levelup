/**
 * Copyright-free content: simple words + basic human values + short moral stories.
 * For ASD-friendly learning. English language. Different content per level.
 *
 * EASY = single value words (kind, share, help)
 * MEDIUM = short value sentences (We share. Be kind.)
 * HARD = short moral stories (2–3 sentences) + one simple question
 */

// ---- EASY: Single value words ----
const VALUE_WORDS = [
  'kind', 'share', 'help', 'friend', 'please', 'thank you', 'sorry', 'happy',
  'love', 'care', 'gentle', 'calm', 'brave', 'honest', 'patient', 'smile',
];
function option(id, label) {
  return { id, label };
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const TARGET_ITEMS = 100;
function buildEasyListeningItems(level, grade) {
  const items = [];
  for (let i = 0; i < TARGET_ITEMS; i++) {
    const word = VALUE_WORDS[i % VALUE_WORDS.length];
    const others = VALUE_WORDS.filter((w) => w !== word).slice(0, 2);
    const opts = shuffle([option(`c_${word}_${i}`, word), ...others.map((w, j) => option(`w_${i}_${j}`, w))]);
    items.push({
      id: `val_e_${level}_${grade}_${i}`,
      level,
      grade,
      difficulty: 'easy',
      text_for_tts: word,
      instruction_tts: 'Listen. Click the word you hear.',
      options: opts,
      correct_id: opts.find((o) => o.label === word)?.id ?? `c_${word}_${i}`,
      order: i,
      goal: 'Value word',
    });
  }
  return items;
}

// ---- MEDIUM: Short value sentences ----
const VALUE_SENTENCES = [
  { text: 'We share.', meaning: 'Sharing is good.' },
  { text: 'Be kind.', meaning: 'Kindness matters.' },
  { text: 'I help my friend.', meaning: 'Helping is good.' },
  { text: 'Say please.', meaning: 'Please is a kind word.' },
  { text: 'Thank you.', meaning: 'We say thanks.' },
  { text: 'I am sorry.', meaning: 'Saying sorry is brave.' },
  { text: 'We are gentle.', meaning: 'Gentle hands are safe.' },
  { text: 'Take turns.', meaning: 'Everyone gets a turn.' },
  { text: 'Tell the truth.', meaning: 'Honesty is right.' },
  { text: 'We care.', meaning: 'We care for others.' },
];
function buildMediumListeningItems(level, grade) {
  const items = [];
  const wrong = ['That is wrong.', 'I do not know.', 'Maybe later.'];
  for (let i = 0; i < TARGET_ITEMS; i++) {
    const s = VALUE_SENTENCES[i % VALUE_SENTENCES.length];
    const opts = shuffle([
      option('correct', s.meaning),
      option('a', wrong[i % 3]),
      option('b', wrong[(i + 1) % 3]),
    ]);
    items.push({
      id: `val_m_${level}_${grade}_${i}`,
      level,
      grade,
      difficulty: 'medium',
      text_for_tts: s.text,
      instruction_tts: 'Listen to the sentence. Then click what it means.',
      options: opts,
      correct_id: 'correct',
      order: i,
      goal: 'Value sentence',
    });
  }
  return items;
}

// ---- HARD: Short moral stories (2–3 sentences) + one question ----
const MORAL_STORIES = [
  {
    story: 'Ravi had two apples. He gave one to his friend. His friend smiled.',
    question: 'What did Ravi do?',
    correct: 'He shared.',
    wrong: ['He ran.', 'He slept.'],
  },
  {
    story: 'Meera saw a sad boy. She sat with him and said kind words. The boy felt better.',
    question: 'What did Meera do?',
    correct: 'She was kind.',
    wrong: ['She left.', 'She shouted.'],
  },
  {
    story: 'The dog was stuck. Tom helped it get out. The dog wagged its tail.',
    question: 'What did Tom do?',
    correct: 'He helped.',
    wrong: ['He ran away.', 'He was angry.'],
  },
  {
    story: 'Lina broke the cup. She said sorry. Her mum said it is okay.',
    question: 'What did Lina say?',
    correct: 'Sorry.',
    wrong: ['No.', 'Bye.'],
  },
  {
    story: 'Everyone wanted to play. They took turns. Everyone had fun.',
    question: 'How did they play?',
    correct: 'They took turns.',
    wrong: ['They fought.', 'They left.'],
  },
  {
    story: 'Sam found a toy. It was not his. He gave it to the teacher.',
    question: 'What did Sam do?',
    correct: 'He was honest.',
    wrong: ['He hid it.', 'He broke it.'],
  },
  {
    story: 'The bird was hurt. Priya was gentle. She put it in a safe place.',
    question: 'How was Priya?',
    correct: 'Gentle.',
    wrong: ['Loud.', 'Angry.'],
  },
  {
    story: 'It was hard to wait. Jay waited for his turn. He felt proud.',
    question: 'What did Jay do?',
    correct: 'He was patient.',
    wrong: ['He pushed.', 'He cried.'],
  },
  {
    story: 'Ana had one biscuit. She gave half to her brother. Both were happy.',
    question: 'What did Ana do?',
    correct: 'She shared.',
    wrong: ['She ate it all.', 'She threw it.'],
  },
  {
    story: 'The teacher asked who broke the vase. Leo said: I did. The teacher said thank you for telling the truth.',
    question: 'What did Leo do?',
    correct: 'He was honest.',
    wrong: ['He ran.', 'He said nothing.'],
  },
];
function buildHardListeningItems(level, grade) {
  const items = [];
  for (let i = 0; i < TARGET_ITEMS; i++) {
    const s = MORAL_STORIES[i % MORAL_STORIES.length];
    const opts = shuffle([option('correct', s.correct), option('a', s.wrong[0]), option('b', s.wrong[1])]);
    items.push({
      id: `val_h_${level}_${grade}_${i}`,
      level,
      grade,
      difficulty: 'hard',
      text_for_tts: `${s.story} ${s.question}`,
      instruction_tts: 'Listen to the short story. Then click the right answer.',
      options: opts,
      correct_id: opts.find((o) => o.id === 'correct')?.id ?? 'correct',
      order: i,
      goal: 'Moral story',
      story: s.story,
      question: s.question,
    });
  }
  return items;
}

// ---- Export: get content by level, grade, difficulty ----
export function getValuesListeningContent(level, grade, difficulty) {
  const easy = buildEasyListeningItems(level, grade);
  const medium = buildMediumListeningItems(level, grade);
  const hard = buildHardListeningItems(level, grade);
  if (difficulty === 'easy') return easy;
  if (difficulty === 'medium') return medium;
  return hard;
}

// Short value phrases for Reading puzzle (easy = 2–3 words)
const VALUE_PHRASES_EASY = ['Be kind.', 'We share.', 'Say please.', 'Thank you.', 'I help.', 'We care.', 'Be gentle.', 'Take turns.', 'I am kind.', 'We are friends.', 'Say sorry.', 'Be calm.', 'We try.', 'He helps.', 'She shares.', 'They care.', 'I smile.', 'We wait.', 'Be brave.', 'Tell the truth.', 'I am honest.', 'We take turns.', 'She is gentle.', 'He is kind.', 'They are calm.', 'I am patient.', 'We are honest.', 'Be patient.', 'Say thanks.', 'I care.', 'We love.', 'She is brave.', 'He is calm.', 'They share.', 'I wait.', 'We smile.', 'Be honest.', 'She is kind.', 'He helps.', 'They are gentle.'];
const VALUE_PHRASES_MEDIUM = VALUE_SENTENCES.map((s) => s.text);
const VALUE_PHRASES_HARD = ['Ravi shared his apple.', 'Meera was kind to the boy.', 'Tom helped the dog.', 'Lina said sorry.', 'They took turns to play.', 'Sam was honest with the teacher.', 'Priya was gentle with the bird.', 'Jay was patient and waited.', 'Ana shared her biscuit.', 'Leo told the truth to the teacher.', 'We should be kind to others.', 'Taking turns is fair.', 'Saying sorry is brave.', 'Helping friends is good.', 'Sharing makes everyone happy.', 'Being honest is right.', 'We care for our friends.', 'Stay calm when it is hard.', 'She was kind to the new girl.', 'He shared his toy with his brother.'];

export function getValuesReadingSentences(difficulty) {
  if (difficulty === 'easy') return VALUE_PHRASES_EASY.map((s) => ({ sentence: s, words: s.trim().split(/\s+/) }));
  if (difficulty === 'medium') return VALUE_SENTENCES.map((s) => ({ sentence: s.text, words: s.text.trim().split(/\s+/) }));
  return MORAL_STORIES.map((s) => ({
    sentence: s.story,
    words: s.story.trim().split(/\s+/).filter(Boolean),
    question: s.question,
    correct: s.correct,
  }));
}

/** Returns puzzle items for Reading drag-drop: { id, level, grade, difficulty, sentence, words, correctOrder, order }. At least 100 items. */
export function getValuesReadingPuzzles(level, grade, difficulty) {
  const phrases = difficulty === 'easy' ? VALUE_PHRASES_EASY : difficulty === 'medium' ? VALUE_PHRASES_MEDIUM : VALUE_PHRASES_HARD;
  const list = phrases.map((s, i) => {
    const sentence = typeof s === 'string' ? s : s.text;
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    return {
      id: `val_r_${level}_${grade}_${difficulty}_${i}`,
      level,
      grade,
      difficulty,
      sentence,
      words,
      correctOrder: sentence,
      order: i,
    };
  });
  if (list.length >= TARGET_ITEMS) return list;
  const out = [];
  for (let i = 0; i < TARGET_ITEMS; i++) {
    const p = list[i % list.length];
    out.push({ ...p, id: `val_r_${level}_${grade}_${difficulty}_${i}`, order: i });
  }
  return out;
}

/** Speaking: repeat/say value words or sentences. Same item shape as listening (text_for_tts, options, correct_id). */
export function getValuesSpeakingContent(level, grade, difficulty) {
  const listening = getValuesListeningContent(level, grade, difficulty);
  return listening.map((item) => ({
    ...item,
    instruction_tts: difficulty === 'easy'
      ? 'Listen. Then say the word you hear.'
      : difficulty === 'medium'
      ? 'Listen to the sentence. Then say it.'
      : 'Listen to the short story. Then say the answer to the question.',
  }));
}

/** Writing: value words with simple wrong spellings (copyright-free). At least 100 items. */
const VALUE_SPELLINGS = [
  { word: 'kind', wrong: ['kindd', 'kend'] },
  { word: 'share', wrong: ['shere', 'shar'] },
  { word: 'help', wrong: ['helpp', 'halp'] },
  { word: 'friend', wrong: ['frend', 'freiend'] },
  { word: 'happy', wrong: ['happi', 'hppy'] },
  { word: 'love', wrong: ['lov', 'luv'] },
  { word: 'care', wrong: ['caree', 'car'] },
  { word: 'gentle', wrong: ['jentle', 'gentel'] },
  { word: 'calm', wrong: ['calmm', 'caln'] },
  { word: 'brave', wrong: ['brav', 'braive'] },
  { word: 'honest', wrong: ['honnest', 'honist'] },
  { word: 'patient', wrong: ['pacient', 'patiant'] },
  { word: 'smile', wrong: ['smille', 'smil'] },
  { word: 'please', wrong: ['pleese', 'plese'] },
  { word: 'sorry', wrong: ['sory', 'sorre'] },
  { word: 'thank', wrong: ['thankk', 'thnak'] },
  { word: 'peace', wrong: ['peice', 'pece'] },
  { word: 'truth', wrong: ['trueth', 'truth'] },
  { word: 'turn', wrong: ['turnn', 'tarn'] },
];
export function getValuesWritingContent(level, grade, difficulty) {
  const items = [];
  for (let i = 0; i < TARGET_ITEMS; i++) {
    const s = VALUE_SPELLINGS[i % VALUE_SPELLINGS.length];
    const opts = shuffle([
      option('correct', s.word),
      option('a', s.wrong[0]),
      option('b', s.wrong[1]),
    ]);
    items.push({
      id: `val_w_${level}_${grade}_${i}`,
      level,
      grade,
      difficulty: 'easy',
      text_for_tts: s.word,
      instruction_tts: 'Listen to the word. Then click the correct spelling.',
      options: opts,
      correct_id: opts.find((o) => o.label === s.word)?.id ?? 'correct',
      order: i,
    });
  }
  return items;
}

export { VALUE_WORDS, VALUE_SENTENCES, MORAL_STORIES };
