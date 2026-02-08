# Where inattentive alert is sent & where the database comes from

## 1. Where is the inattentive alert sent?

The **inattentiveness alert** (voice + email to parent) is sent from **two places**:

### A. Learning pages (Home, Listening, Speaking, Reading, Writing and their /play routes)

- **File:** `src/components/Layout.jsx`
- **What happens:**
  - **Lines 107–114:** `handleInattentive` runs. It:
    - Speaks: *"You are not alert. Please look at the screen."*
    - Plays a short tone
    - Calls **`notifyParentInattentive(email, name)`** to send the email
  - **Lines 122–126:** A `setInterval` runs every **20 seconds** and calls `handleInattentive`. So every 20 seconds while the child is on any learning page, the voice + email are triggered.

So the **email is sent from:**  
`Layout.jsx` → `handleInattentive` → **`src/utils/notifyParent.js`** → `notifyParentInattentive()` → **EmailJS** (`emailjs.send(...)`).

### B. Login page (child view only)

- **File:** `src/components/LoginPage.jsx`
- **Lines 233–237:** `handleInattentive` again calls `notifyParentInattentive(registeredChild.parentEmail, registeredChild.childName)`.
- **Lines 243–246:** A `setInterval` every 20 seconds calls this `handleInattentive` when `mode === 'child'` and the child is registered.

So the **same email function** is used in:
1. **`src/utils/notifyParent.js`** – defines `notifyParentInattentive(parentEmail, childName)` and sends the email via EmailJS.
2. **`src/components/Layout.jsx`** – calls it every 20s on learning pages.
3. **`src/components/LoginPage.jsx`** – calls it every 20s on the child login screen.

---

## 2. Where did the database come from?

There is **no external database** right now. All content is **in-code** in your repo:

| Content | File | What it is |
|--------|------|------------|
| Listening | `src/data/listeningContent.js` | Arrays and loops that build items (words, sounds, instructions) in code. |
| Speaking | `src/data/speakingContent.js` | Same: words and sentences defined in the file. |
| Reading (puzzle) | `src/data/readingPuzzleContent.js` | Sentences and puzzles defined in the file. |
| Reading (comprehension) | `src/data/readingContent.js` | Sentences and meanings in code. |
| Writing | `src/data/writingContent.js` | Spelling words in code. |
| Writing (letters) | `src/data/writingLetterContent.js` | Words for letter-drop in code. |

So the “database” is **original content written in these JavaScript files** – no copy-paste from books or websites. To add more **copyright-free** content you can:

- Keep adding **original** sentences, words, and short stories in these files.
- Use **public domain** texts (e.g. simple word lists, Aesop’s fables) and put them into the same structure.
- Later, replace the in-code arrays with **JSON files** or an **API** that returns the same structure; the rest of the app can stay the same.

---

## 3. Summary

- **Inattentive email is sent from:**  
  - **Code path:** `Layout.jsx` or `LoginPage.jsx` → `handleInattentive` → **`notifyParentInattentive()`** in **`src/utils/notifyParent.js`** → EmailJS.
- **Database:** All content is **in your code** in `src/data/*.js` (and optionally JSON); nothing is from an external database yet.
