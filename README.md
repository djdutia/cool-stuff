# People. Data. AI

A small site for sharing HR-focused Claude skills and a bit of other stuff.
Plain HTML/CSS/JS, no build step, deployed to Vercel.

## Structure

```
index.html            Home page
skills.html           Claude Skills page (renders data/skills.js)
favorites.html        Other stuff page (renders data/favorites.js)
try.html              Live demo of the Work Sample Builder
css/style.css         All styling (light/dark, incl. manual toggle, print)
js/main.js            Renders cards, theme toggle
js/try.js             Try-it page: file upload, streaming, Save as PDF
data/skills.js        <-- edit this to add/remove Claude skills
data/favorites.js     <-- edit this to add/remove items on "Other stuff"
downloads/            .skill package files linked from skill cards
api/try-work-sample.js  Serverless function behind the try-it page
lib/work-sample-skill.js The skill text the function sends to Claude
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

## Getting in touch

The home page ends with a LinkedIn button rather than a contact form.

An email form lived here previously, routed through FormSubmit's "invisible
email" alias so the address stayed out of the page source. It worked
server-side but proved unreliable in real browsers — `formsubmit.co` sits on
some tracker blocklists, so ad blockers and privacy extensions silently broke
it for exactly the visitors most likely to be reading. A LinkedIn link has no
third-party dependency that can fail, and nothing to keep activated.

If a form is ever wanted again, note that a Vercel serverless proxy is *not*
a workaround: FormSubmit sits behind Cloudflare, which blocks requests from
Vercel's serverless IPs.

## The try-it page

`try.html` lets a visitor paste or upload a job description and get the Work
Sample Builder's three documents (candidate brief, evaluator pack, scenario
materials), each with a Save as PDF button and the dhrumeel.xyz credit line.
The browser never sees the API key; `api/try-work-sample.js` calls Claude
(Sonnet 5.5, fixed prompt, fixed output cap) and streams the result back.

Credit protection, cheapest check first:

1. **Fails closed.** If any of the environment variables below is missing, the
   demo is off. Set `TRY_DISABLED=1` to switch it off on purpose.
2. **Origin check, size limits.** Only dhrumeel.xyz (and this project's preview
   URLs) may call it. Job descriptions must be 200–12,000 characters.
3. **Cloudflare Turnstile.** A single-use human check, verified server-side.
4. **Usage caps in Redis.** 2 runs per visitor per day, 10 per day overall,
   100 per month overall. Override with `TRY_LIMIT_IP_DAY`, `TRY_LIMIT_DAY`,
   `TRY_LIMIT_MONTH`. Visitors are keyed by a salted hash; raw IPs aren't stored.
5. **Haiku pre-check.** A cheap call confirms the text is a job description
   before the expensive one runs.
6. **Anthropic workspace spend limit.** The final backstop, set in the
   Anthropic Console, not in code.

Environment variables (Vercel → Project → Settings → Environment Variables):

| Variable | Where it comes from |
|---|---|
| `ANTHROPIC_API_KEY` | A key from a dedicated Anthropic workspace with a monthly spend limit |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Added automatically when Upstash Redis is connected from the Vercel Marketplace (`UPSTASH_REDIS_REST_URL`/`_TOKEN` also work) |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare dashboard → Turnstile → add widget for `dhrumeel.xyz` |

When the Work Sample Builder skill changes, regenerate
`lib/work-sample-skill.js` from the new SKILL.md (front matter removed) so the
demo and the download stay in sync.

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
no build step — Vercel serves the pages as static files, and installs the two
npm packages in `package.json` for the try-it function.

To add a skill: drop the `.skill` package in `downloads/`, add its entry to
`data/skills.js`, commit, and push. That's the whole release process.

Commits are authored as `djdutia@users.noreply.github.com` (set in the repo's
local git config) so the real address stays out of this public repo.
