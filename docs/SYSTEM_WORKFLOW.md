# Level Up Learning – System Workflow, Novelty, and Effectiveness

## 1. System workflow (how the system works)

### 1.1 Entry and registration

1. **User opens the app** → lands on **Login** page (`/login`).
2. **Parent/mentor flow:**
   - Chooses **Parent/Mentor** mode.
   - Fills: child name, parent email, avatar (picture for the child), 4–6 login images (pictures the child will tap to log in), class type (primary 1–5 or secondary 6–10), grade.
   - Submits **Register**. Data is saved in **app context** and **localStorage** (no backend). Voice confirms registration.
3. **Child login:**
   - Mode is switched to **Child** (or user selects Child).
   - Voice says who is logging in and asks to click one of the child’s pictures.
   - Child **clicks their chosen login image** (no typing). Voice welcomes them; app navigates to **Home** (`/home`). The same child data (name, parent email, grade, etc.) is used everywhere.

### 1.2 Learning pages (after child is logged in)

- All routes under `/home`, `/listening`, `/speaking`, `/reading`, `/writing` are **protected**: if no child is registered/logged in, user is redirected to `/login`.
- **Layout** wraps these pages and provides:
  - **Navbar** (Home, Listening, Speaking, Reading, Writing).
  - **Main content** (the current page).
  - **Sidebar:** Attention Monitor (camera), and **Calm moment** (novelty).

### 1.3 Four modules (Listening, Speaking, Reading, Writing)

- **Each module** has a landing page (e.g. `/listening`) where the child chooses **Easy / Medium / Hard** and taps **Start**.
- **Activity page** (e.g. `/listening/play`):
  - Content is loaded by **grade** and **difficulty** from `src/data/` (and values content for English + values).
  - **Voice (TTS)** reads instructions and questions.
  - Child answers (click option, speak, drag words, or choose spelling). On **wrong** answer, the app shows and speaks the **correct answer** (“The correct answer is … Let’s try again”).
  - **Progress** (score, difficulty) is saved to **localStorage** after the round. **Badges** (e.g. first time completing a module) are unlocked and shown on Home.

### 1.4 Inattentiveness monitoring and parent alert

- **Where it runs:** Inside **Layout** (on every learning page) and on **Login** in child view.
- **How:** A **timer** runs every **20 seconds**. When it fires:
  - **Voice:** “You are not alert. Please look at the screen.”
  - **Sound:** Short confirmation tone.
  - **Email:** If the child has a parent email, the app calls **EmailJS** with that email and sends an alert (e.g. “[Child name] was not alert. Please check in.”). The **To** field in EmailJS must be `{{to_email}}` so the parent receives it.
- **Camera:** Turned on on learning pages for “focus” only; **not recorded or stored** (no MediaRecorder, no upload).

### 1.5 Data and content (“database”)

- **No external database.** All content lives in **`src/data/*.js`** (and optionally JSON): `listeningContent.js`, `speakingContent.js`, `readingContent.js`, `readingPuzzleContent.js`, `writingContent.js`, `writingLetterContent.js`, `moralValuesContent.js`.
- **Content is differentiated by difficulty:** Easy (e.g. value words), Medium (value sentences), Hard (short moral stories + question). 100+ items per content set where applicable.
- **Progress and badges** are stored in **localStorage** (`levelUpProgress`, `levelUpRegisteredChild`).

### 1.6 High-level flow diagram (text)

```
[Login] → Parent registers (child name, email, avatar, login images, class, grade)
       → Child taps login image → [Home]

[Home] → Choose module (Listening / Speaking / Reading / Writing)
      → Choose Easy / Medium / Hard → Start → [Activity]

[Activity] → TTS + question → Child answers → Correct: next / Wrong: show correct answer + retry
          → Round ends → Save score + badge → Back or Play again

[Layout (all learning pages)]
  → Sidebar: Camera (live only), Calm moment button
  → Every 20s: inattentive? → Voice + tone + Email to parent (via EmailJS)
  → If “Calm moment” active: timer paused, overlay until “I’m ready”
```

---

## 2. Novelty features (included in the system)

### 2.1 Calm moment (implemented)

- **What:** A **“Take a calm moment”** button in the **sidebar** on every learning page (Layout). The child can tap it **any time**.
- **What happens:**
  - The **inattentiveness 20s timer is paused** (no email, no voice alert during the break).
  - A **full-screen overlay** appears with:
    - A **soft breathing animation** (circle that gently grows and shrinks).
    - Short message: *“Let’s take a calm breath. When you’re ready, we’ll continue.”*
    - **“I’m ready”** button.
  - When the child taps **“I’m ready”**, the overlay closes, voice says “You are ready. Let us continue,” and the timer **resumes**.
- **Why it’s novel:** The child **chooses** when to pause; the app supports **self-regulation** with a short, predictable routine. No punishment, no time-out—just a co-regulation moment.

### 2.2 Other novelty ideas (documented, not yet built)

- **Predictable routine strip:** Show “Today: Listening → Reading → Writing” and let the child tick steps as done.
- **“How I feel” after a story:** After a moral story (Hard), let the child tap happy / okay / need break; app responds with one short supportive line.
- **Same voice, same pace:** One TTS voice and speed for all instructions (already largely true; can be made configurable).
- **No sudden sounds:** All sounds are soft and short; option to mute effects but keep voice.
- **“I’m ready” before each question:** Optional per-activity setting so the child taps “I’m ready” before the next question plays (child-controlled pacing).

These are described in **`docs/DATA_AND_DEPLOY.md`** and **`docs/NOVELTY_IDEA.md`** for future implementation.

---

## 3. Is this system effective?

### 3.1 Strengths (why it can be effective)

- **Designed for mild ASD:** Picture-based login (no typing), voice guidance, predictable structure, high-contrast UI, and content that teaches **simple English plus basic values** (kind, share, help, sorry, thank you) and **short moral stories**.
- **Differentiated difficulty:** Easy (words), Medium (sentences), Hard (stories + question) with **different content** per level, not just more options.
- **Teacher-like correction:** On wrong answer, the app **shows and speaks the correct answer**, then encourages another try—supportive and clear.
- **Attention support:** Camera as a focus cue, inattentiveness alert (voice + email to parent) so adults can check in. **Calm moment** gives the child a way to pause without penalty.
- **Motivation:** Badges, last scores per module, and motivation quotes on Home; progress stored so the child can see continuity.
- **Values and language together:** Content combines simple words/sentences with sharing, kindness, honesty, and turn-taking—useful for both language and social-emotional learning.

### 3.2 Limitations and ways to improve

- **No real attention detection:** The “inattentiveness” trigger is **time-based only** (every 20s), not based on camera/face detection. So the email is a **periodic check-in** rather than a true “child looked away” alert. Effectiveness could increase with optional face/attention detection (privacy and complexity to consider).
- **No professional oversight:** The app doesn’t replace a therapist or teacher. It’s a **practice and support tool** at home or in a supervised setting.
- **Single child per device:** Registration is one child per browser/device (localStorage). For multiple children you’d need multi-profile or a backend.
- **Content depth:** 100+ items per content type is good for variety; long-term effectiveness can be improved by adding more stories, more values, and perhaps **adaptive difficulty** (e.g. adjust level based on recent performance).

### 3.3 Overall

The system is **well-aligned with mild ASD needs**: predictable flow, voice support, picture-based interaction, values-based content, corrective feedback, and a **novelty feature (Calm moment)** that supports self-regulation. It is **effective as a supportive learning and check-in tool** when used alongside caregiver involvement (e.g. responding to emails and supporting calm moments). Its effectiveness is **increased by** the Calm moment feature, teacher-like correction, and differentiated content; it would be **even more effective** with optional attention detection, more content over time, and clear guidance for parents on how to use the alerts and the Calm moment in daily routine.
