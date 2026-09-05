# People. Data. AI

A small site for sharing HR-focused Claude skills and a bit of other stuff.
Plain HTML/CSS/JS, no build step, deployed to Vercel.

## Structure

```
index.html          Home page
skills.html          Claude Skills page (renders data/skills.js)
favorites.html        Other stuff page (renders data/favorites.js)
css/style.css         All styling (light/dark, incl. manual toggle)
js/main.js            Renders cards, theme toggle, contact form handling
data/skills.js         <-- edit this to add/remove Claude skills
data/favorites.js       <-- edit this to add/remove items on "Other stuff"
downloads/              .skill package files linked from skill cards
```

## Adding a new skill

Open `data/skills.js` and copy the existing object in the `SKILLS` array,
then edit the fields:

- `id` — unique, lowercase, hyphenated
- `title`, `description` — shown on the card (description supports `\n\n`
  for paragraph breaks)
- `content` — the exact skill file text, shown in the expandable preview.
  Use a backtick template string for multi-line content.
- `downloadUrl` — path under `downloads/` to the `.skill` package.

## Adding an item to "Other stuff"

Same idea in `data/favorites.js` — copy an object in the `FAVORITES` array
and edit `title`, `category`, `note`, and optionally `url`.

## The "Got thoughts?" contact box

The form on the home page posts straight from the browser to FormSubmit's
"invisible email" endpoint — a random token stands in for the real address,
so visitors never see it, and there's no server involved (a plain server-side
proxy was tried first, but Vercel's serverless IPs get stopped by
FormSubmit's Cloudflare bot check; a real browser request doesn't).

**One-time setup, done once by the site owner:**
1. Submit anything through the form once (or POST directly to
   `https://formsubmit.co/ajax/you@example.com`). FormSubmit emails a
   confirmation link to that address.
2. Click "Confirm". FormSubmit's response (and the confirmation page) then
   includes a random string — this is the "invisible email" token.
3. Open `js/main.js` and replace `REPLACE_WITH_FORMSUBMIT_HASH` (near the
   top, in `FORMSUBMIT_HASH`) with that token, then redeploy.

Until that's done, the form will show "Something went wrong" on submit.

## Dark / light mode

Follows system preference by default. The toggle in the nav overrides it and
remembers the choice in `localStorage` per browser.

## Previewing locally

No install needed for the static pages:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploying

The repo at `github.com/djdutia/cool-stuff` is connected to the Vercel project
`hr-ai-skills-hub`, so **every push to `main` deploys automatically**. There is
no build step — Vercel serves the pages as static files.

To add a skill: drop the `.skill` package in `downloads/`, add its entry to
`data/skills.js`, commit, and push. That's the whole release process.

Commits are authored as `djdutia@users.noreply.github.com` (set in the repo's
local git config) so the real address stays out of this public repo.
