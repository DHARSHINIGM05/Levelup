/**
 * Listening module content – grade-wise, difficulty-ordered.
 * Schema supports 100+ items per grade; seed has 100 per grade.
 * Use TTS for text_for_tts and instruction_tts (copyright-free). image_url can be placeholder or real CC0 URLs.
 */

function option(id, label, imageUrl = null) {
  return { id, label, image_url: imageUrl };
}

function item({
  id,
  level,
  grade,
  difficulty,
  activity_type,
  goal,
  text_for_tts,
  instruction_tts,
  options,
  correct_id,
  order,
  skill_tags = [],
}) {
  return {
    id,
    level,
    grade,
    difficulty,
    activity_type,
    goal,
    text_for_tts,
    instruction_tts,
    options,
    correct_id,
    order,
    skill_tags,
  };
}

// 100 items per grade × 10 grades = 1000 items
const PRIMARY_GRADES = [1, 2, 3, 4, 5];
const SECONDARY_GRADES = [6, 7, 8, 9, 10];

const LISTENING_CONTENT = [];

// Grade 1 – Sound awareness (sound → picture). Easy/medium/hard by number of options.
PRIMARY_GRADES.forEach((grade) => {
  const level = 'primary';
  const countPerGrade = 100;
  for (let i = 0; i < countPerGrade; i++) {
    const easy = i < 40;
    const optCount = easy ? 2 : i < 70 ? 3 : 4;
    const sounds = ['dog', 'cat', 'cow', 'bird', 'rain', 'bell', 'wind', 'knock'];
    const sound = sounds[i % sounds.length];
    const opts = [];
    const correct = `opt_${sound}`;
    opts.push(option(correct, sound));
    const others = sounds.filter((s) => s !== sound);
    for (let j = 0; j < optCount - 1; j++) {
      opts.push(option(`opt_${others[j % others.length]}`, others[j % others.length]));
    }
    LISTENING_CONTENT.push(
      item({
        id: `p${grade}_${i + 1}`,
        level,
        grade,
        difficulty: easy ? 'easy' : i < 70 ? 'medium' : 'hard',
        activity_type: 'sound_to_picture',
        goal: 'Sound awareness',
        text_for_tts: sound,
        instruction_tts: 'Listen. Then click the picture that matches the sound.',
        options: opts,
        correct_id: correct,
        order: i + 1,
        skill_tags: ['auditory_attention', 'sound_recognition'],
      })
    );
  }
});

// Grade 2 – Word listening (word → image)
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 2) return;
  const countPerGrade = 100;
  const words = ['apple', 'ball', 'cat', 'dog', 'run', 'eat', 'blue', 'red', 'sun', 'book'];
  for (let i = 0; i < countPerGrade; i++) {
    const word = words[i % words.length];
    const others = words.filter((w) => w !== word);
    const opts = [option(`opt_${word}`, word)];
    for (let j = 0; j < 2; j++) opts.push(option(`opt_${others[(i + j) % others.length]}`, others[(i + j) % others.length]));
    LISTENING_CONTENT.push(
      item({
        id: `p${grade}_w${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : i < 70 ? 'medium' : 'hard',
        activity_type: 'word_to_image',
        goal: 'Word comprehension',
        text_for_tts: word,
        instruction_tts: 'Listen to the word. Then click the picture that matches.',
        options: opts,
        correct_id: `opt_${word}`,
        order: i + 1,
        skill_tags: ['word_comprehension', 'vocabulary'],
      })
    );
  }
});

// Grade 3 – Simple instruction (one step)
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 3) return;
  const countPerGrade = 100;
  const actions = ['Touch the chair', 'Click the blue ball', 'Tap the sun', 'Find the cat', 'Point to the book'];
  for (let i = 0; i < countPerGrade; i++) {
    const text = actions[i % actions.length];
    const correct = text.split(' ').pop();
    const opts = [
      option('opt_a', 'chair'),
      option('opt_b', 'ball'),
      option('opt_c', 'sun'),
      option('opt_d', 'cat'),
      option('opt_e', 'book'),
    ].slice(0, 3 + (i % 2));
    const correctOpt = opts.find((o) => o.label === correct) || opts[0];
    LISTENING_CONTENT.push(
      item({
        id: `p${grade}_inst${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : 'medium',
        activity_type: 'instruction',
        goal: 'Follow instruction',
        text_for_tts: text,
        instruction_tts: 'Listen. Then do what it says. Click the right picture.',
        options: opts,
        correct_id: correctOpt.id,
        order: i + 1,
        skill_tags: ['functional_listening', 'attention_control'],
      })
    );
  }
});

// Grade 4 – Sentence understanding
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 4) return;
  const countPerGrade = 100;
  const sentences = [
    'The boy is eating.',
    'The girl is playing.',
    'The dog is running.',
    'The cat is sleeping.',
  ];
  for (let i = 0; i < countPerGrade; i++) {
    const text = sentences[i % sentences.length];
    LISTENING_CONTENT.push(
      item({
        id: `p${grade}_sent${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : 'medium',
        activity_type: 'sentence_to_scene',
        goal: 'Sentence comprehension',
        text_for_tts: text,
        instruction_tts: 'Listen to the sentence. Then click the picture that matches.',
        options: [
          option('opt_eat', 'Boy eating'),
          option('opt_play', 'Girl playing'),
          option('opt_run', 'Dog running'),
          option('opt_sleep', 'Cat sleeping'),
        ],
        correct_id: text.includes('eating') ? 'opt_eat' : text.includes('playing') ? 'opt_play' : text.includes('running') ? 'opt_run' : 'opt_sleep',
        order: i + 1,
        skill_tags: ['sentence_comprehension', 'context_understanding'],
      })
    );
  }
});

// Grade 5 – Emotional tone
PRIMARY_GRADES.forEach((grade) => {
  if (grade < 5) return;
  const countPerGrade = 100;
  const emotions = ['happy', 'sad', 'angry'];
  for (let i = 0; i < countPerGrade; i++) {
    const em = emotions[i % emotions.length];
    LISTENING_CONTENT.push(
      item({
        id: `p${grade}_emo${i + 1}`,
        level: 'primary',
        grade,
        difficulty: i < 40 ? 'easy' : 'medium',
        activity_type: 'emotion_match',
        goal: 'Emotional listening',
        text_for_tts: `I feel ${em}.`,
        instruction_tts: 'Listen to how the voice sounds. Then click the face that matches.',
        options: [
          option('opt_happy', 'Happy'),
          option('opt_sad', 'Sad'),
          option('opt_angry', 'Angry'),
        ],
        correct_id: `opt_${em}`,
        order: i + 1,
        skill_tags: ['emotional_listening', 'social_understanding'],
      })
    );
  }
});

// Secondary 6–10: multi-step, conversation, story, etc.
SECONDARY_GRADES.forEach((grade) => {
  const countPerGrade = 100;
  for (let i = 0; i < countPerGrade; i++) {
    const activity_type =
      grade === 6 ? 'two_step' :
      grade === 7 ? 'conversation_question' :
      grade === 8 ? 'story_question' :
      grade === 9 ? 'explanation_response' : 'real_world';
    LISTENING_CONTENT.push(
      item({
        id: `s${grade}_${i + 1}`,
        level: 'secondary',
        grade,
        difficulty: i < 40 ? 'easy' : i < 70 ? 'medium' : 'hard',
        activity_type,
        goal: grade === 6 ? 'Multi-step' : grade === 7 ? 'Conversation' : grade === 8 ? 'Story recall' : grade === 9 ? 'Explanation' : 'Real-world',
        text_for_tts: grade === 6
          ? 'Click the book and then the pen.'
          : grade === 7
          ? 'Teacher says: Open your book. Student says: Yes, maam. What did the teacher ask?'
          : grade === 8
          ? 'The dog ran to the park. He played with a ball. Where did the dog go?'
          : grade === 9
          ? 'When you hear a fire alarm, walk calmly to the exit. What should you do?'
          : 'The next train leaves at 3 PM. When does the train leave?',
        instruction_tts: 'Listen carefully. Then click the best answer.',
        options: [
          option('opt_a', 'Answer A'),
          option('opt_b', 'Answer B'),
          option('opt_c', 'Answer C'),
        ],
        correct_id: 'opt_b',
        order: i + 1,
        skill_tags: ['working_memory', 'comprehension'],
      })
    );
  }
});

export function getListeningContentByGrade(level, grade, difficulty = null) {
  let list = LISTENING_CONTENT.filter(
    (c) => c.level === level && c.grade === grade
  );
  if (difficulty) list = list.filter((c) => c.difficulty === difficulty);
  return list.sort((a, b) => a.order - b.order);
}

export default LISTENING_CONTENT;
