# Deploying HostelMate

Everything (frontend + backend) deploys from one Render Blueprint, so you only need two accounts, both one-click via "Continue with GitHub":

## 0. Accounts (create these yourself — I can't sign up on your behalf)
1. **GitHub** — https://github.com/signup
2. **Render** — https://render.com — sign up with "Continue with GitHub"

Tell me once both exist.

## 1. Push the code to GitHub
I'll run this for you once you're signed in:
```
cd ~/hostel-mate
gh auth login          # opens your browser to log in
gh repo create hostelmate --public --source=. --remote=origin --push
```

## 2. Deploy on Render
1. Render dashboard → **New +** → **Blueprint**
2. Select your `hostelmate` repo — Render reads `render.yaml` automatically and shows **two** services: `hostelmate-api` (backend) and `hostelmate-web` (frontend)
3. Click **Apply** — Render builds both and wires the frontend's `VITE_API_BASE` to the backend's URL automatically (no manual copy-pasting)
4. When it's done you get one link, e.g. `https://hostelmate-web.onrender.com` — that's what you share with your hostel

That's it — one blueprint, one click, both services live.

**Heads up:** the free plan has no persistent disk, so the SQLite file resets whenever the backend redeploys or spins down from inactivity (free services also sleep after 15 min idle and take ~30s to wake back up on the next visit). Fine for testing with friends now; if this becomes the real thing for the whole hostel, we should move to a hosted Postgres database so data survives.

## 3. Sanity check
Open the Render frontend URL, add a test room, then open it in a different browser/incognito window to confirm someone else sees it too.
