# HR AI Lab

A small static site for sharing HR-focused Claude skills and a few favorite
things. No build step, no framework — plain HTML/CSS/JS, deployed to Vercel.

## Structure

```
index.html          Home page
skills.html          Claude Skills page (renders data/skills.js)
favorites.html        Fav Things page (renders data/favorites.js)
css/style.css         All styling (light + dark mode via prefers-color-scheme)
js/main.js            Renders the skill/favorite cards, filtering, copy-to-clipboard
data/skills.js         <-- edit this to add/remove Claude skills
data/favorites.js       <-- edit this to add/remove favorite things
```

## Adding a new skill

Open `data/skills.js` and copy one of the existing objects in the `SKILLS`
array, then edit the fields:

- `id` — unique, lowercase, hyphenated
- `title`, `description`, `tags` — shown on the card
- `content` — the exact skill file text, shown in the expandable code block
  with a copy button. Use a backtick template string for multi-line content.

## Adding a new favorite thing

Same idea in `data/favorites.js` — copy an object in the `FAVORITES` array
and edit `title`, `category`, `note`, and optionally `url` (leave `""` if it
doesn't link anywhere).

## Previewing locally

No install needed — just serve the folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploying

This repo has no framework to detect — Vercel serves it as a static site.
Every push to the connected Git branch deploys automatically once this
project is linked to Vercel. To deploy manually without Git, use the Vercel
CLI or dashboard's "upload" flow.
