# Today's English Phrases — Deployment Guide

This is a small React app: every day it shows 5 vocabulary cards, then 3
English sentences, for a 3rd-grade learner. Progress (streak, completed
days) is saved in the browser's `localStorage`, so it's per-device/per-browser.

There are two ways to get this online. **Option A is the easiest — no
account, no coding, no terminal.**

---

## Option A: Netlify Drop (fastest, no install needed)

1. Unzip `dist.zip` — you'll get a folder called `dist`.
2. Go to **https://app.netlify.com/drop** in your browser.
3. Drag the whole `dist` folder onto the page.
4. Wait a few seconds — Netlify gives you a live URL like
   `https://random-name-123.netlify.app`. Share that link with your family.

That's it — no sign-up required for a quick deploy. If you want to keep
this URL permanently (so it doesn't get cleaned up later) or want a
custom name, create a free Netlify account and "claim" the site after
dropping it.

> Note: With this method, you'll need to repeat the drag-and-drop step
> any time you want to update the content (e.g. if Claude helps you
> change the sentences again).

---

## Option B: GitHub + Vercel (better for ongoing updates)

This method connects your code to GitHub, and Vercel automatically
rebuilds your site every time you push a change.

1. Unzip `source.zip` — this is the actual project source code (not the
   built version).
2. Create a free account at **https://github.com** if you don't have one.
3. Create a new (empty) repository, e.g. `daily-english-notice`.
4. On your computer, open a terminal in the unzipped `source` folder and run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daily-english-notice.git
   git push -u origin main
   ```
5. Go to **https://vercel.com**, sign in with your GitHub account.
6. Click "Add New Project", select your `daily-english-notice` repo.
7. Vercel auto-detects it's a Vite app. Just click **Deploy**.
8. You'll get a URL like `daily-english-notice.vercel.app`.

From now on, any time you `git push` a change, Vercel automatically
rebuilds and redeploys the site.

---

## Running it locally first (optional)

If you have [Node.js](https://nodejs.org) installed, you can preview the
site on your own computer before deploying:

```
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

---

## Notes

- The app uses the browser's `localStorage` to remember streaks/progress.
  This means progress is tied to one browser on one device — if your child
  opens the link on a different phone or browser, it starts fresh.
- The pronunciation button uses the browser's built-in text-to-speech
  (Web Speech API), so it needs internet/device support for English voices
  — this works on virtually all modern phones and computers.
