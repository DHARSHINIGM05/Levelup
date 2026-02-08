# Content (DB) attribution, novelty ideas, and deployment

## 1. “Where did you get the database?”

You do **not** need to say “from Cursor.” You can say:

- **“We created the content for this project.”**  
  All sentences, words, stories, and value phrases in `src/data/*.js` are original content written for Level Up Learning. They were authored as part of the project (with or without AI-assisted editing in your IDE). The “database” is just these in-repo files—no external API or third‑party dataset.

- **“The content is in-house / project-authored.”**  
  Same idea: it’s your project’s content. Cursor (or any editor) is a tool; the copyright and ownership of the content belong to the project.

- If someone asks **“Who wrote the sentences?”**:  
  **“The content was written for this app to teach simple English and basic values to children.”**  
  You don’t have to mention the editor or AI unless you want to.

So: **content = created for this project; database = the JS/JSON files in the repo.**

---

## 2. Extra novelty ideas (beyond “Calm moment”)

1. **Predictable routine strip**  
   At the start of a session, show a horizontal strip: “Today: Listening → Reading → Writing” (or whatever the child will do). Tapping each step marks it “done” with a check. Gives a clear, predictable sequence (helpful for ASD).

2. **“How I feel” after a story**  
   After a moral story (Hard level), show 2–3 simple faces (happy / okay / need break). Child taps one. The app says one short line (e.g. “You feel okay. Great.”) and does not change the score. Supports emotional labeling without pressure.

3. **Same voice, same pace**  
   Use one TTS voice and one speed for all instructions (configurable in one place). Predictable audio reduces anxiety.

4. **No sudden sounds**  
   All sounds (correct/wrong, calm moment) are soft and short. No surprise loud noises. Option to turn off sound effects but keep voice.

5. **“I’m ready” before each question**  
   After each instruction, show a single button: “I’m ready.” Only when the child taps it does the question/audio play. Puts the child in control of pacing.

---

## 3. Deployment steps (short version)

### A. One-time setup

1. **Build locally**
   ```bash
   npm install
   npm run build
   ```
   This creates a `dist` folder. Open `dist/index.html` in a browser to test.

2. **Email (inattentiveness alert)**  
   - In [EmailJS](https://dashboard.emailjs.com): create a service (e.g. Gmail), create a template.  
   - In the template:
     - **To:** set to `{{to_email}}` (so the parent’s email goes here).
     - **Body:** use `{{childName}}` and `{{message}}`.
   - In the project, `src/utils/notifyParent.js` already sends `to_email`, `to`, `childName`, `message`.  
   - If email still doesn’t arrive: check spam, check template “To” uses `{{to_email}}`, and that the EmailJS service is connected (e.g. Gmail SMTP).

### B. Deploy to Vercel (recommended)

1. Sign up at [vercel.com](https://vercel.com).
2. Install CLI: `npm i -g vercel`.
3. In the project folder: `vercel`.
4. Link to your Git repo or upload. Vercel will use `npm run build` and output `dist`.
5. Ensure `vercel.json` has:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
   so React Router works on refresh.
6. After deploy, open the app URL, log in as parent/child, go to a learning page, wait ~20 seconds: parent email should get the inattentiveness alert (if template and service are correct).

### C. Deploy to Netlify

1. Sign up at [netlify.com](https://netlify.com).
2. New site → connect Git repo (or drag-and-drop `dist`).
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add a redirect: create `public/_redirects` with:
   ```
   /*    /index.html   200
   ```
   so all routes serve the SPA.

### D. Deploy to GitHub Pages

1. `npm install --save-dev gh-pages`
2. In `package.json`: set `"homepage": "https://YOUR_USERNAME.github.io/level-up-learning"` and add script `"deploy": "vite build && gh-pages -d dist"`.
3. In `vite.config.js`: set `base: '/level-up-learning/'`.
4. Run `npm run deploy`.
5. In GitHub: repo → Settings → Pages → Source: branch `gh-pages`, folder `/ (root)`.

---

## 4. If the inattentiveness email is still not sent

1. **Template “To” field**  
   In EmailJS template, the recipient must be set to `{{to_email}}`. If it’s fixed to your own email or empty, the parent won’t get it.

2. **Service connection**  
   In EmailJS, the email service (e.g. Gmail) must be connected and verified.

3. **Browser console**  
   Open DevTools → Console. When the 20s timer fires, check for “Could not notify parent:” or EmailJS errors. That will show if the request failed (e.g. wrong IDs, blocklist).

4. **Spam**  
   Ask the parent to check spam/junk and to allow emails from your sending address.

5. **IDs**  
   In `src/utils/notifyParent.js`, confirm `EMAILJS_SERVICE`, `EMAILJS_TEMPLATE`, and `EMAILJS_PUBLIC_KEY` match your EmailJS dashboard.
