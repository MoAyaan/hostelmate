# Deploying HostelMate

## 0. Accounts you need (create these yourself in a browser)
1. GitHub — https://github.com/signup
2. Render (backend) — https://render.com — easiest to sign up with "Continue with GitHub"
3. Vercel (frontend) — https://vercel.com — also sign up with "Continue with GitHub"

Come back here once all three exist.

## 1. Push this project to GitHub
```
cd ~/hostel-mate
git init
git add .
git commit -m "Initial commit"
gh auth login          # opens your browser to log in to GitHub
gh repo create hostelmate --public --source=. --remote=origin --push
```
(If you don't have the `gh` CLI, create an empty repo named `hostelmate` on github.com instead, then:
`git remote add origin <the URL github gives you> && git branch -M main && git push -u origin main`)

## 2. Deploy the backend on Render
1. Render dashboard → **New +** → **Blueprint**
2. Pick your `hostelmate` repo — Render reads `render.yaml` at the repo root automatically
3. Click **Apply** — it builds `server/` and gives you a URL like `https://hostelmate-api.onrender.com`
4. Note that URL, you need it in the next step

**Heads up:** the free plan has no persistent disk, so the SQLite file resets whenever the service redeploys or spins down from inactivity. Fine for testing with friends now; if it becomes the real thing for the whole hostel, come back and we'll move to a hosted Postgres database instead.

## 3. Deploy the frontend on Vercel
1. Vercel dashboard → **Add New** → **Project** → import your `hostelmate` repo
2. Set **Root Directory** to `web`
3. Framework preset should auto-detect as Vite
4. Under **Environment Variables**, add:
   - `VITE_API_BASE` = the Render URL from step 2 (no trailing slash), e.g. `https://hostelmate-api.onrender.com`
5. Click **Deploy**

Vercel gives you a live URL (e.g. `hostelmate.vercel.app`) — that's what you share with your hostel.

## 4. Sanity check
Open the Vercel URL, add a test room, then open it again in a different browser/incognito window to confirm the room shows up for someone else too (proves the backend + database round-trip works over the internet, not just localhost).
