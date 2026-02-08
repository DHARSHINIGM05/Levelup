/**
 * Writing module – grade-wise. Choose correct spelling or complete the word.
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

const spellings = [
  { word: 'cat', wrong: ['kat', 'cet', 'cot'] },
  { word: 'dog', wrong: ['dogg', 'bog', 'dag'] },
  { word: 'sun', wrong: ['son', 'sunn', 'sin'] },
  { word: 'ball', wrong: ['bal', 'boll', 'bell'] },
  { word: 'book', wrong: ['bok', 'booc', 'bouk'] },
  { word: 'red', wrong: ['reed', 'rad', 'rid'] },
  { word: 'run', wrong: ['runn', 'ran', 'ron'] },
  { word: 'big', wrong: ['bigg', 'beg', 'bag'] },
  { word: 'kind', wrong: ['kindd', 'kend', 'kine'] },
  { word: 'help', wrong: ['helpp', 'halp', 'helb'] },
  { word: 'share', wrong: ['shere', 'shar', 'shair'] },
  { word: 'happy', wrong: ['happi', 'hppy', 'hapy'] },
  { word: 'love', wrong: ['lov', 'luv', 'loev'] },
  { word: 'friend', wrong: ['frend', 'freiend', 'freind'] },
  { word: 'care', wrong: ['caree', 'car', 'caer'] },
  { word: 'gentle', wrong: ['jentle', 'gentel', 'gentl'] },
  { word: 'calm', wrong: ['calmm', 'caln', 'calm'] },
  { word: 'brave', wrong: ['brav', 'braive', 'braev'] },
  { word: 'honest', wrong: ['honnest', 'honist', 'honets'] },
];
PRIMARY_GRADES.forEach((grade) => {
  for (let i = 0; i < 100; i++) {
    const s = spellings[i % spellings.length];
    const opts = [option('correct', s.word), ...s.wrong.slice(0, 2).map((w, j) => option(`w_${j}`, w))];
    CONTENT.push(
      item({
        id: `wr_p${grade}_${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 25 ? 'easy' : i < 45 ? 'medium' : 'hard',
        text_for_tts: s.word,
        instruction_tts: 'Listen to the word. Then click the correct spelling.',
        options: opts,
        correct_id: 'correct',
        order: i + 1,
      })
    );
  }
});

const words = ['apple', 'happy', 'water', 'school', 'friend', 'kind', 'share', 'help', 'gentle', 'brave', 'honest', 'patient', 'smile', 'please', 'sorry', 'thank', 'family', 'mother', 'father', 'sister'];
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 3) return;
  for (let i = 0; i < 100; i++) {
    const w = words[i % words.length];
    const wrong = [w.slice(0, -1) || w + 'x', w + 'e', w.slice(0, 2) + w.slice(3)].filter((x) => x !== w).slice(0, 2);
    const opts = [option('correct', w), ...wrong.map((x, j) => option(`w_${j}`, x))];
    CONTENT.push(
      item({
        id: `wr_p${grade}_s${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : 'medium',
        text_for_tts: w,
        instruction_tts: 'Listen to the word. Click the correct spelling.',
        options: opts,
        correct_id: 'correct',
        order: 100 + i + 1,
      })
    );
  }
});

SECONDARY_GRADES.forEach((grade) => {
  const spellingsSec = [
    { word: 'because', wrong: ['becuase', 'becaus', 'beacuse'] },
    { word: 'beautiful', wrong: ['beutiful', 'beautifull', 'beautifel'] },
    { word: 'tomorrow', wrong: ['tommorow', 'tomorow', 'tommorrow'] },
    { word: 'together', wrong: ['togheter', 'togather', 'togethr'] },
    { word: 'important', wrong: ['importent', 'importent', 'improtant'] },
    { word: 'different', wrong: ['diferent', 'diffrent', 'differant'] },
    { word: 'remember', wrong: ['rember', 'remmember', 'rememder'] },
    { word: 'sometimes', wrong: ['sometims', 'somtimes', 'sometime'] },
    { word: 'everyone', wrong: ['every one', 'everybody', 'evryone'] },
    { word: 'certainly', wrong: ['certainely', 'certanly', 'certainly'] },
  ];
  for (let i = 0; i < 100; i++) {
    const s = spellingsSec[i % spellingsSec.length];
    const opts = [option('correct', s.word), ...s.wrong.map((w, j) => option(`w_${j}`, w))];
    CONTENT.push(
      item({
        id: `wr_s${grade}_${i + 1}`,
        level: 'secondary',
        grade,
        difficulty: i < 25 ? 'easy' : 'medium',
        text_for_tts: s.word,
        instruction_tts: 'Listen to the word. Click the correct spelling.',
        options: opts,
        correct_id: 'correct',
        order: i + 1,
      })
    );
  }
});

export function getWritingContentByGrade(level, grade) {
  return CONTENT.filter((c) => c.level === level && c.grade === grade).sort((a, b) => a.order - b.order);
}

export default CONTENT;
