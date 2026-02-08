/**
 * Writing – letter drop: spell the word by dragging letters into boxes.
 * difficulty: easy = 3 letters, medium = 4–5, hard = 6+
 */
const PRIMARY = [1, 2, 3, 4, 5];
const SECONDARY = [6, 7, 8, 9, 10];

const WORDS_EASY = [
  'cat', 'dog', 'sun', 'run', 'red', 'big', 'sit', 'top', 'hat', 'pen', 'cup', 'bus', 'egg', 'fish', 'kind', 'help', 'love', 'care', 'smile', 'calm', 'go', 'eat', 'see', 'play', 'read', 'sing', 'draw', 'jump', 'walk', 'sleep', 'blue', 'ball', 'book', 'bird', 'milk', 'star', 'tree', 'moon', 'hand', 'foot', 'face', 'home', 'door', 'car', 'bike', 'boat', 'cake', 'rice', 'tea', 'boy', 'girl', 'mom', 'dad', 'baby', 'pet', 'toy', 'bed', 'box', 'key', 'map', 'bag', 'cap', 'sock', 'shoe', 'coat', 'desk', 'lamp', 'sofa', 'table', 'chair', 'wall', 'floor', 'room', 'bath', 'soap', 'towel', 'comb', 'brush', 'bell', 'drum', 'harp', 'horn', 'flag', 'gift', 'card', 'mail', 'park', 'pool', 'zoo', 'shop', 'farm', 'barn', 'nest', 'leaf', 'flower', 'grass', 'sand', 'snow', 'rain', 'wind',
];
const WORDS_MEDIUM = [
  'ball', 'book', 'fish', 'bird', 'happy', 'water', 'apple', 'share', 'friend', 'gentle', 'brave', 'honest', 'please', 'sorry', 'thank', 'school', 'house', 'table', 'window', 'garden', 'morning', 'evening', 'dinner', 'breakfast', 'banana', 'orange', 'purple', 'yellow', 'pencil', 'paper', 'ruler', 'eraser', 'crayon', 'picture', 'letter', 'number', 'circle', 'square', 'triangle', 'rabbit', 'turtle', 'monkey', 'panda', 'tiger', 'lion', 'mouse', 'horse', 'sheep', 'cloud', 'river', 'mountain', 'forest', 'island', 'bridge', 'street', 'garden', 'kitchen', 'bathroom', 'bedroom', 'brother', 'sister', 'family', 'teacher', 'doctor', 'nurse', 'farmer', 'driver', 'baker', 'dancer', 'singer', 'runner', 'swimmer', 'writer', 'reader', 'player', 'helper', 'walker', 'sleeper', 'eater', 'thinker', 'dreamer', 'lover', 'carer', 'sharer', 'smiler', 'waiter', 'turner', 'keeper', 'finder', 'maker', 'giver', 'taker', 'holder', 'mover', 'caller', 'sender', 'builder', 'painter', 'drawer', 'rider', 'climber', 'jumper', 'hopper', 'sitter', 'stander', 'looker', 'listener', 'speaker',
];
const WORDS_HARD = [
  'school', 'friend', 'yellow', 'elephant', 'beautiful', 'together', 'important', 'different', 'remember', 'sometimes', 'everyone', 'certainly', 'wonderful', 'kindness', 'sharing', 'helping', 'careful', 'peaceful', 'powerful', 'colorful', 'thankful', 'hopeful', 'morning', 'evening', 'breakfast', 'dinner', 'picture', 'number', 'circle', 'square', 'triangle', 'rabbit', 'turtle', 'monkey', 'panda', 'window', 'garden', 'kitchen', 'bathroom', 'bedroom', 'brother', 'sister', 'family', 'teacher', 'doctor', 'banana', 'orange', 'purple', 'pencil', 'paper', 'ruler', 'eraser', 'crayon', 'letter', 'animal', 'person', 'people', 'mother', 'father', 'little', 'middle', 'bottle', 'apple', 'purple', 'simple', 'castle', 'turtle', 'garden', 'market', 'basket', 'jacket', 'pocket', 'rocket', 'bucket', 'blanket', 'magnet', 'target', 'wallet', 'helmet', 'pumpkin', 'problem', 'winter', 'summer', 'autumn', 'spring', 'butter', 'finger', 'sister', 'brother', 'grandma', 'grandpa', 'cousin', 'family', 'people', 'little', 'middle', 'bottle', 'simple', 'castle', 'garden', 'market', 'basket', 'jacket', 'pocket', 'rocket', 'bucket', 'blanket', 'wallet', 'helmet', 'pumpkin', 'winter', 'summer', 'butter', 'finger',
];

const CONTENT = [];
let id = 0;

function addWords(words, level, grade, difficulty) {
  words.forEach((word) => {
    id += 1;
    const letters = word.split('');
    CONTENT.push({
      id: `wl_${id}`,
      level,
      grade,
      difficulty,
      word,
      letters,
      order: id,
    });
  });
}

PRIMARY.forEach((g) => {
  addWords(WORDS_EASY, 'primary', g, 'easy');
  addWords(WORDS_MEDIUM, 'primary', g, 'medium');
  addWords(WORDS_HARD, 'primary', g, 'hard');
});
SECONDARY.forEach((g) => {
  addWords(WORDS_EASY, 'secondary', g, 'easy');
  addWords(WORDS_MEDIUM, 'secondary', g, 'medium');
  addWords(WORDS_HARD, 'secondary', g, 'hard');
});

export function getWritingLetterByGrade(level, grade, difficulty) {
  return CONTENT
    .filter((c) => c.level === level && c.grade === grade && c.difficulty === difficulty)
    .sort((a, b) => a.order - b.order);
}

export function getWritingLetterByGradeAny(level, grade) {
  return CONTENT
    .filter((c) => c.level === level && c.grade === grade)
    .sort((a, b) => a.order - b.order);
}
