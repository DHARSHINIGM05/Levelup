# How to put your folder into a Git repo (GitHub)

Follow these steps in order. Use the **terminal** in Cursor (Terminal → New Terminal, or press Ctrl+`).

---

## Step 1: Go to your project folder

In Cursor you already have the project open, so the terminal is usually **in the right folder** (you might see `level-up-learning` in the path). If not, type:

```bash
cd "C:\Users\gmdha\Desktop\chandru uncle\level-up-learning"
```

(Use your real path if it’s different.)

---

## Step 2: Initialize Git (if not already)

Check if Git is already set up:

```bash
git status
```

- If it says **"not a git repository"**, run:
  ```bash
  git init
  ```
- If it lists files or says "On branch ...", Git is already initialized. Skip to Step 3.

---

## Step 3: Add all your files

Your project has a `.gitignore` file, so things like `node_modules` and `dist` won’t be added (that’s good).

```bash
git add .
```

This adds all files in the folder (respecting .gitignore).

---

## Step 4: Save (commit) the files

```bash
git commit -m "First commit: Level Up Learning app"
```

You’ve now saved a snapshot of your project in Git **on your computer**.

---

## Step 5: Create a repo on GitHub

1. Go to **[github.com](https://github.com)** and sign in (or create an account).
2. Click the **+** at the top right → **New repository**.
3. **Repository name:** e.g. `level-up-learning` (no spaces).
4. **Public** is fine. Do **not** tick "Add a README" or "Add .gitignore" (you already have them).
5. Click **Create repository**.

GitHub will show a page with commands. You’ll need the **URL** of your repo, e.g.:
`https://github.com/YOUR_USERNAME/level-up-learning.git`

---

## Step 6: Connect your folder to GitHub

In the **same terminal** in Cursor, run (replace with **your** GitHub username and repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/level-up-learning.git
```

Example: if your username is `gmdharshini`, then:
```bash
git remote add origin https://github.com/gmdharshini/level-up-learning.git
```

If it says "branch 'main' does not exist" or you need to set the branch name:

```bash
git branch -M main
```

---

## Step 7: Push your files to GitHub

```bash
git push -u origin main
```

- The first time, GitHub may ask you to **log in** (browser or username/password/token).
- After it finishes, **all your files** (except those in .gitignore) will be on GitHub.

You can refresh your repo page on GitHub and you’ll see your folder’s files there.

---

## Summary

| Step | Command / action |
|------|-------------------|
| 1 | Be in project folder (Cursor terminal is usually there) |
| 2 | `git init` (only if `git status` said "not a git repository") |
| 3 | `git add .` |
| 4 | `git commit -m "First commit: Level Up Learning app"` |
| 5 | On GitHub: New repository → name it → Create |
| 6 | `git remote add origin https://github.com/YOUR_USERNAME/level-up-learning.git` |
| 7 | `git branch -M main` then `git push -u origin main` |

After this, your folder is in a Git repo on GitHub. When you change files later, use:

```bash
git add .
git commit -m "Describe what you changed"
git push
```
