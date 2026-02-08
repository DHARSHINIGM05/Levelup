# Deploy Level Up Learning

Follow these steps to build and deploy the app.

## 1. Build the app

From the project root:

```bash
npm install
npm run build
```

This creates a `dist` folder with static files. You can open `dist/index.html` in a browser to test locally.

## 2. Fix inattentiveness email (if parent does not receive it)

The app sends an email to the parent when inattentiveness is detected (every 20 seconds on learning pages). If the email is not received:

1. **EmailJS template**  
   In [EmailJS Dashboard](https://dashboard.emailjs.com) → your template:
   - Set the **To** field to `{{to_email}}` (this is the parent’s address).
   - In the body use `{{childName}}` and `{{message}}`.
2. **Email service**  
   Make sure the email service (e.g. Gmail) is connected and verified in EmailJS.
3. **Spam**  
   Ask the parent to check spam/junk and to allow the sender.
4. **Console**  
   Open browser DevTools → Console. When the 20s timer runs, look for errors like “Could not notify parent:” to see if the request failed.
5. **IDs**  
   In `src/utils/notifyParent.js`, confirm `EMAILJS_SERVICE`, `EMAILJS_TEMPLATE`, and `EMAILJS_PUBLIC_KEY` match your EmailJS dashboard.

## 3. Deploy to a static host

### Option A: Vercel (recommended)

1. Sign up at [vercel.com](https://vercel.com).
2. Install Vercel CLI: `npm i -g vercel`
3. In the project folder run: `vercel`
4. Follow prompts (link to Git or upload). Vercel will detect Vite and set build command to `npm run build` and output to `dist`.
5. Add environment variables in Vercel dashboard if you use any (e.g. for a future API). EmailJS keys are in the frontend code; for production you may move them to env and use `import.meta.env.VITE_EMAILJS_*`.

**Important:** The app uses client-side routes (React Router). In Vercel, add a `vercel.json` in the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

So all paths serve `index.html` and React Router can handle them.

### Option B: Netlify

1. Sign up at [netlify.com](https://netlify.com).
2. Connect your Git repo or drag-and-drop the `dist` folder.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add a file `public/_redirects` (or `dist/_redirects` after build) with one line:

```
/*    /index.html   200
```

This redirects all routes to `index.html` for React Router.

### Option C: GitHub Pages

1. Install: `npm install --save-dev gh-pages`
2. In `package.json` add:
   - `"homepage": "https://YOUR_USERNAME.github.io/level-up-learning"`
   - Under `scripts`: `"deploy": "vite build && gh-pages -d dist"`
3. In `vite.config.js` set `base: '/level-up-learning/'` (your repo name).
4. Run: `npm run deploy`
5. In GitHub repo → Settings → Pages → Source: gh-pages branch.

## 4. After deploy

- Test: open the deployed URL, log in (parent/child), play each module, and check that inattentiveness email is sent (wait ~20 seconds on a learning page).
- Camera and microphone (for Speaking) need HTTPS and user permission; they work on Vercel/Netlify (HTTPS by default).
- EmailJS works from the browser; no server needed. Keep your EmailJS keys in the code or in `VITE_*` env vars.

## 5. Optional: environment variables for EmailJS

To hide keys in production:

1. In the project root create `.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```
2. In `src/utils/notifyParent.js` use:
   `import.meta.env.VITE_EMAILJS_SERVICE_ID`, etc.
3. In Vercel/Netlify, add the same variables in the dashboard so the build gets them.
