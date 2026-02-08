/**
 * Reading module – grade-wise. Read sentence/text and choose correct meaning or missing word.
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

const simpleSentences = [
  { text: 'The cat is red.', meaning: 'A cat is red in color.' },
  { text: 'I have a ball.', meaning: 'I own a ball.' },
  { text: 'She runs fast.', meaning: 'She runs quickly.' },
  { text: 'We go to school.', meaning: 'We go to school.' },
  { text: 'The sun is hot.', meaning: 'The sun is very warm.' },
  { text: 'I am happy.', meaning: 'I feel happy.' },
  { text: 'We share.', meaning: 'Sharing is good.' },
  { text: 'Be kind.', meaning: 'Kindness matters.' },
  { text: 'She has a book.', meaning: 'She owns a book.' },
  { text: 'The dog barks.', meaning: 'The dog makes a sound.' },
  { text: 'He is my friend.', meaning: 'He is a friend.' },
  { text: 'Say please.', meaning: 'Use the word please.' },
  { text: 'Thank you.', meaning: 'We say thanks.' },
  { text: 'I help my friend.', meaning: 'Helping is good.' },
  { text: 'Take turns.', meaning: 'Everyone gets a turn.' },
];
const wrongMeaningsPool = ['A dog is red.', 'I lost a ball.', 'She walks slowly.', 'We stay home.', 'The moon is cold.', 'I feel sad.', 'We keep it.', 'Be loud.', 'She lost a book.', 'The cat sleeps.', 'He is a teacher.', 'Say no.', 'Goodbye.', 'I run away.', 'Go first.'];
PRIMARY_GRADES.forEach((grade) => {
  for (let i = 0; i < 100; i++) {
    const s = simpleSentences[i % simpleSentences.length];
    const opts = [option('correct', s.meaning), option('a', wrongMeaningsPool[i % wrongMeaningsPool.length]), option('b', wrongMeaningsPool[(i + 2) % wrongMeaningsPool.length])];
    CONTENT.push(
      item({
        id: `rd_p${grade}_${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : i < 70 ? 'medium' : 'hard',
        text_for_tts: s.text,
        display_text: s.text,
        instruction_tts: 'Read the sentence. Then click what it means.',
        options: opts,
        correct_id: 'correct',
        order: i + 1,
      })
    );
  }
});

const fillWords = [
  { sentence: 'The ___ is big.', options: ['cat', 'and', 'the'], correct: 'cat' },
  { sentence: 'I ___ to school.', options: ['go', 'am', 'is'], correct: 'go' },
  { sentence: 'She ___ a book.', options: ['has', 'have', 'had'], correct: 'has' },
  { sentence: 'We ___ kind.', options: ['are', 'is', 'was'], correct: 'are' },
  { sentence: 'He ___ my friend.', options: ['is', 'are', 'am'], correct: 'is' },
  { sentence: 'They ___ happy.', options: ['are', 'is', 'be'], correct: 'are' },
  { sentence: 'I ___ a ball.', options: ['have', 'has', 'had'], correct: 'have' },
  { sentence: 'The sun ___ hot.', options: ['is', 'are', 'am'], correct: 'is' },
  { sentence: '___ share.', options: ['We', 'She', 'He'], correct: 'We' },
  { sentence: '___ please.', options: ['Say', 'Says', 'Said'], correct: 'Say' },
];
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 2) return;
  for (let i = 0; i < 100; i++) {
    const f = fillWords[i % fillWords.length];
    const opts = f.options.map((l, idx) => option(`o_${idx}`, l));
    const correctId = `o_${f.options.indexOf(f.correct)}`;
    CONTENT.push(
      item({
        id: `rd_p${grade}_f${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : 'medium',
        text_for_tts: f.sentence.replace('___', f.correct),
        display_text: f.sentence,
        instruction_tts: 'Read the sentence. Click the word that fits in the blank.',
        options: opts,
        correct_id: correctId,
        order: 100 + i + 1,
      })
    );
  }
});

SECONDARY_GRADES.forEach((grade) => {
  const sentences = [
    { text: 'The weather is nice today.', meaning: 'The weather is good today.' },
    { text: 'He finished his homework.', meaning: 'He completed his homework.' },
    { text: 'She was kind to the new girl.', meaning: 'She was nice to the new girl.' },
    { text: 'We should take turns.', meaning: 'Everyone should get a turn.' },
    { text: 'Being honest is right.', meaning: 'Telling the truth is correct.' },
    { text: 'They shared the toys.', meaning: 'They gave each other turns with the toys.' },
    { text: 'Say thank you when you get help.', meaning: 'We say thanks when someone helps.' },
    { text: 'He said sorry for the mistake.', meaning: 'He apologized.' },
    { text: 'We care for our friends.', meaning: 'We look after our friends.' },
    { text: 'Stay calm when it is hard.', meaning: 'Keep calm when it is difficult.' },
  ];
  const wrongMeanings = ['The weather is bad today.', 'He started his homework.', 'She went home.', 'They are playing.', 'She was rude.', 'We should run.', 'Lying is good.', 'They kept the toys.', 'Say nothing.', 'He ran away.', 'We ignore them.', 'Get angry.'];
  for (let i = 0; i < 100; i++) {
    const s = sentences[i % sentences.length];
    const wrong = wrongMeanings[i % wrongMeanings.length];
    const wrong2 = wrongMeanings[(i + 2) % wrongMeanings.length];
    const opts = [
      option('correct', s.meaning),
      option('a', wrong),
      option('b', wrong2),
    ];
    CONTENT.push(
      item({
        id: `rd_s${grade}_${i + 1}`,
        level: 'secondary',
        grade,
        difficulty: i < 25 ? 'easy' : 'medium',
        text_for_tts: s.text,
        display_text: s.text,
        instruction_tts: 'Read the sentence. Then click the correct meaning.',
        options: opts,
        correct_id: 'correct',
        order: i + 1,
      })
    );
  }
});

export function getReadingContentByGrade(level, grade) {
  return CONTENT.filter((c) => c.level === level && c.grade === grade).sort((a, b) => a.order - b.order);
}

export default CONTENT;
