# Drew Glassman Jobs

Personal job search dashboard. Next.js + React.

## Deploy to the internet (fastest path — ~10 min, free)

You'll use **Vercel** (the company that makes Next.js). It gives you a free public URL.

### One-time setup

1. Install Node.js on your computer if you don't have it: https://nodejs.org (pick the LTS version).
2. Create a free GitHub account if you don't have one: https://github.com/signup
3. Create a free Vercel account and connect it to GitHub: https://vercel.com/signup

### Deploy

1. Unzip this project somewhere on your computer.
2. Open a terminal (Mac: "Terminal" app. Windows: "PowerShell") and `cd` into the folder:
   ```
   cd path/to/drew-jobs
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Test it locally first:
   ```
   npm run dev
   ```
   Open http://localhost:3000 — you should see your dashboard. Press Ctrl+C to stop.
5. Push to GitHub:
   - Create a new empty repo on github.com (e.g. `drew-glassman-jobs`).
   - Back in the terminal:
     ```
     git init
     git add .
     git commit -m "initial"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/drew-glassman-jobs.git
     git push -u origin main
     ```
6. Go to https://vercel.com/new, pick the repo you just pushed, and click **Deploy**. About 60 seconds later you'll get a URL like `drew-glassman-jobs.vercel.app`.

### Custom domain (optional)

In your Vercel project dashboard → Settings → Domains, you can connect a domain you own (e.g. `drewglassman.com`) — about $12/year at Namecheap or Cloudflare.

## How data is stored

Your apps, saved listings, prep questions, and contact info are saved in **your browser's localStorage**. This means:
- Data persists across visits on the same browser
- Data is NOT synced across devices (phone vs laptop = separate data)
- Clearing browser data will erase it
- Visitors see a fresh empty dashboard — only you see your data

If you want cross-device sync later, the upgrade path is a database like Supabase (free tier available).

## Local development

```
npm install
npm run dev
```
