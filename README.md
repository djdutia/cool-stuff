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
