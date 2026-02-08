/**
 * Speaking module – grade-wise. Listen and choose the word/sentence (oral comprehension).
 * Same schema as listening: level, grade, difficulty, text_for_tts, instruction_tts, options, correct_id, order.
 */
function option(id, label) {
  return { id, label };
}

function item(o) {
  return { ...o };
}

const PRIMARY_GRADES = [1, 2, 3, 4, 5];
const SECONDARY_GRADES = [6, 7, 8, 9, 10];
const CONTENT = [];

const words1 = ['cat', 'dog', 'sun', 'run', 'ball', 'book', 'red', 'big', 'sit', 'top', 'hat', 'pen', 'cup', 'bus', 'egg', 'fish', 'kind', 'help', 'share', 'friend', 'happy', 'love', 'apple', 'bird', 'milk', 'star'];
PRIMARY_GRADES.forEach((grade) => {
  for (let i = 0; i < 100; i++) {
    const w = words1[i % words1.length];
    const others = words1.filter((x) => x !== w);
    const opts = [option(`o_${w}`, w)];
    for (let j = 0; j < 2; j++) opts.push(option(`o_${others[(i + j) % others.length]}`, others[(i + j) % others.length]));
    CONTENT.push(
      item({
        id: `sp_p${grade}_${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 20 ? 'easy' : i < 35 ? 'medium' : 'hard',
        text_for_tts: w,
        instruction_tts: 'Listen. Then click the word you hear.',
        options: opts,
        correct_id: `o_${w}`,
        order: i + 1,
      })
    );
  }
});

const sentences = ['I like apples.', 'The cat is big.', 'She runs fast.', 'We go to school.', 'I am happy.', 'We share.', 'Be kind.', 'Say please.', 'Thank you.', 'I help my friend.', 'The dog runs.', 'She has a ball.', 'We eat lunch.', 'The sun is hot.', 'They are friends.'];
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 3) return;
  for (let i = 0; i < 100; i++) {
    const s = sentences[i % sentences.length];
    const opts = sentences.map((x, idx) => option(`o_${idx}`, x));
    CONTENT.push(
      item({
        id: `sp_p${grade}_s${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 50 ? 'easy' : 'medium',
        text_for_tts: s,
        instruction_tts: 'Listen to the sentence. Then click the sentence you hear.',
        options: opts,
        correct_id: `o_${sentences.indexOf(s)}`,
        order: 100 + i + 1,
      })
    );
  }
});

SECONDARY_GRADES.forEach((grade) => {
  const phrases = ['Good morning.', 'How are you?', 'I am fine.', 'Thank you.', 'See you later.', 'Please help me.', 'I am sorry.', 'Take turns.', 'We are friends.', 'Be gentle.', 'Tell the truth.', 'I feel happy.', 'Let us share.', 'Well done.'];
  for (let i = 0; i < 100; i++) {
    const p = phrases[i % phrases.length];
    const others = phrases.filter((x) => x !== p);
    const opts = [option('o_c', p)];
    for (let j = 0; j < 2; j++) opts.push(option(`o_${j}`, others[(i + j) % others.length]));
    CONTENT.push(
      item({
        id: `sp_s${grade}_${i + 1}`,
        level: 'secondary',
        grade,
        difficulty: i < 20 ? 'easy' : i < 35 ? 'medium' : 'hard',
        text_for_tts: p,
        instruction_tts: 'Listen. Then click the phrase you hear.',
        options: opts,
        correct_id: 'o_c',
        order: i + 1,
      })
    );
  }
});

export function getSpeakingContentByGrade(level, grade) {
  return CONTENT.filter((c) => c.level === level && c.grade === grade).sort((a, b) => a.order - b.order);
}

export default CONTENT;
