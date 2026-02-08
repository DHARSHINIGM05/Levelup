/**
 * Reading – ASD-friendly puzzle: put words in order to form the sentence.
 * difficulty: easy = 3 words, medium = 4, hard = 5+
 */
const PRIMARY = [1, 2, 3, 4, 5];
const SECONDARY = [6, 7, 8, 9, 10];

function sentenceToPuzzle(sentence, difficulty = 'easy') {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (difficulty === 'easy' && wordCount > 3) return null;
  if (difficulty === 'medium' && (wordCount < 3 || wordCount > 4)) return null;
  if (difficulty === 'hard' && wordCount < 4) return null;
  return {
    sentence,
    words: [...words],
    correctOrder: words.join(' '),
  };
}

const SENTENCES_EASY = [
  'I am happy.', 'The cat runs.', 'She is kind.', 'We go home.', 'It is big.',
  'He is tall.', 'We share.', 'Be kind.', 'Say please.', 'Thank you.', 'I help.',
  'We care.', 'Be gentle.', 'She is calm.', 'He is brave.', 'I am honest.', 'We are friends.',
  'I love you.', 'The dog runs.', 'The cat sleeps.', 'Red is nice.', 'Blue is cool.',
  'We are happy.', 'They are kind.', 'It is good.', 'You are brave.', 'I say sorry.',
  'We play.', 'She reads.', 'He sits.', 'They run.', 'Mom cooks.', 'Dad drives.',
  'I try.', 'We wait.', 'Be calm.', 'She smiles.', 'He helps.', 'They share.',
  'Sun shines.', 'Bird flies.', 'Dog barks.', 'Cat sleeps.', 'I eat.', 'We go.',
  'She is good.', 'He is kind.', 'They are calm.', 'It is red.', 'You are kind.',
  'I am calm.', 'We are brave.', 'She is honest.', 'He is gentle.', 'They take turns.',
  'I am gentle.', 'We are honest.', 'She is brave.', 'He is patient.', 'They are gentle.',
  'I am patient.', 'We are gentle.', 'She is patient.', 'He is honest.', 'They are brave.',
  'I am brave.', 'We are patient.', 'She is gentle.', 'He is calm.', 'They are honest.',
  'I share.', 'We help.', 'She cares.', 'He shares.', 'They help.', 'I care.',
  'We smile.', 'She tries.', 'He waits.', 'They play.', 'I wait.', 'We share.',
  'She helps.', 'He cares.', 'They smile.', 'I smile.', 'We help.', 'She waits.',
  'He plays.', 'They try.', 'I try.', 'We try.', 'She plays.', 'He smiles.',
  'They wait.', 'I play.', 'We wait.', 'She shares.', 'He tries.', 'They care.',
];
const SENTENCES_MEDIUM = [
  'The dog is brown.', 'I like to play.', 'She has a ball.', 'We go to school.', 'The sun is hot.',
  'The boy reads a book.', 'My mom cooks food.', 'The fish swims fast.', 'I love my family.', 'The bird can fly.',
  'We share our toys.', 'Be kind to others.', 'I help my friend.', 'Say please and thanks.', 'Take turns to play.',
  'She is a good friend.', 'He is very brave.', 'The cat is soft.', 'We eat at noon.', 'The dog runs fast.',
  'I am so happy.', 'They are best friends.', 'We care for pets.', 'Tell the truth always.', 'She has a red ball.',
  'He has a blue pen.', 'We go home now.', 'The bird can sing.', 'My dad drives well.', 'The sun is bright.',
  'We play in the park.', 'She reads a big book.', 'I like to share.', 'Be gentle with the cat.', 'They take turns.',
  'We say thank you.', 'I am sorry today.', 'The dog is kind.', 'She is my friend.', 'He is very calm.',
];
const SENTENCES_HARD = [
  'The big cat runs fast.', 'I like to play outside.', 'She has a red ball.', 'We go to school every day.',
  'The little bird sings a song.', 'My friend likes to draw pictures.', 'We eat breakfast in the morning.',
  'Ravi shared his apple with a friend.', 'Meera was kind to the sad boy.', 'Tom helped the dog get out.',
  'Lina said sorry to her mum.', 'They took turns to play the game.', 'Sam was honest with the teacher.',
  'We should be gentle with animals.', 'Jay was patient and waited for his turn.', 'Ana shared her biscuit with her brother.',
  'The teacher said tell the truth.', 'We care for our friends every day.', 'I like to play in the sun.',
  'The dog ran to the park today.', 'She has a big red ball to play.', 'My mom cooks food for us.',
  'The little bird can sing a song.', 'We eat breakfast when we wake up.', 'He is a very kind friend.',
  'Take turns when you play together.', 'Say please when you ask for help.', 'We share our toys with friends.',
  'Be gentle when you hold the cat.', 'She was brave and told the truth.', 'They are happy when they share.',
];

const CONTENT = [];
let id = 0;

function addPuzzles(sentences, level, grade, difficulty) {
  sentences.forEach((s) => {
    const p = sentenceToPuzzle(s, difficulty);
    if (p) {
      id += 1;
      CONTENT.push({
        id: `rp_${id}`,
        level,
        grade,
        difficulty,
        sentence: p.sentence,
        words: p.words,
        correctOrder: p.correctOrder,
        order: id,
      });
    }
  });
}

PRIMARY.forEach((g) => {
  addPuzzles(SENTENCES_EASY, 'primary', g, 'easy');
  addPuzzles(SENTENCES_MEDIUM, 'primary', g, 'medium');
  addPuzzles(SENTENCES_HARD, 'primary', g, 'hard');
});
SECONDARY.forEach((g) => {
  addPuzzles(SENTENCES_EASY, 'secondary', g, 'easy');
  addPuzzles(SENTENCES_MEDIUM, 'secondary', g, 'medium');
  addPuzzles(SENTENCES_HARD, 'secondary', g, 'hard');
});

export function getReadingPuzzleByGrade(level, grade, difficulty) {
  return CONTENT
    .filter((c) => c.level === level && c.grade === grade && c.difficulty === difficulty)
    .sort((a, b) => a.order - b.order);
}

export function getReadingPuzzleByGradeAny(level, grade) {
  return CONTENT
    .filter((c) => c.level === level && c.grade === grade)
    .sort((a, b) => a.order - b.order);
}
