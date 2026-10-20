# luciolcv.github.io

Personal academic website of **Lucio La Cava** — a static site (plain HTML + CSS + vanilla JS) served by GitHub Pages, with a tiny deploy-time prerender for search engines.

All content lives in human-editable **YAML files** under `content/`. To update the site you edit a YAML file and push — **you never touch code**.

## Editing content

| File | What it controls |
|------|------------------|
| `content/profile.yaml` | Your name, role, ORCID, email, CV, photo, the **bio** the homepage terminal types, the homepage research-interest cards, and your social links. |
| `content/news.yaml` | News items (homepage shows the latest 5; `news.html` shows all). |
| `content/publications.yaml` | Publications (homepage shows the ones marked `selected: true`; `publications.html` shows all, with search + year/topic filters + BibTeX; filters are kept in the URL, so a filtered view can be shared). |
| `content/projects.yaml` | Projects shown on `projects.html`. |
| `content/teaching.yaml` | Teaching activities shown on `teaching.html`. |
| `content/talks.yaml` | Invited talks, tutorials, courses, and service shown on `talks.html`. |

Each list file has a comment block at the top explaining its fields. To add an entry, copy an existing block and change the values.

**Quick reference:**

- **News** — required: `date` (`YYYY-MM-DD`) and `content`. `content` supports markdown links `[text](url)` and emoji; use `\n` inside the quotes for a line break. `category` is optional (`Publication`, `Talk`, `Travel`, `Award`, `Project`, `Update`); if omitted, the type is auto-detected from the text. Items are sorted newest-first automatically.
- **Publications** — required: `key` (a unique id, e.g. your BibTeX key), `title`, `authors`, `venue`, `year`. Optional: `selected: true` (puts it on the homepage), `tag` (topic label — shown as a chip *and* drives the topic filter on the publications page), `abstract` (shown via an *Abstract* button), `arxiv`, `doi` (bare or full `https://doi.org/…` URL), `pdf`, `code`, `bibtype` (`article` / `inproceedings` / `misc` — only needed when the BibTeX type guessed from `venue` is wrong: arXiv → `misc`, proceedings/findings/workshops → `inproceedings`, everything else → `article`). Write `authors` in BibTeX form (`La Cava, Lucio and Tagarelli, Andrea`); the page displays them as `Lucio La Cava, Andrea Tagarelli`.
- **Projects** — required: `title`, `description`. Optional: `image`, `github`, `demo`.
- **Teaching** — `academicYear`, `category` (`Teaching` → **T** badge, anything else → **TA**), `title`, `degree`, `department`, `institution`, `level` (`PhD` / `Master's` / `Bachelor's`). Optional: `link` (makes the course title a link).
- **Talks** — `type` (`Talk` / `Tutorial` / `Course` / `Service` — groups the page), `title`, `year`. Optional: `venue`, `location`, `link`.

## Previewing locally

Because content is loaded via `fetch()`, you must serve the site over HTTP — opening the files directly from disk (`file://`) will not load content. From the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploying

Push to `main`. The GitHub Action in `.github/workflows/deploy.yml` runs `build.mjs`, which bakes the YAML content into each page's HTML so search engines and link previews see it without running JavaScript, then publishes the result at the domain in `CNAME`. If the build fails (e.g. a YAML typo), the previous site stays live and the error is under the repo's **Actions** tab.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

To preview exactly what gets deployed: `node build.mjs && python3 -m http.server 8000 -d _site`.

## Project layout

```
index.html / news.html / publications.html / projects.html / teaching.html / talks.html
content/        # the YAML files you edit
css/site.css    # design system (tokens + component styles)
js/components.js # render helpers (nav, footer, cards, news, publications…)
js/streaming-bio.js # the homepage "streaming bio" terminal
js/pages.js     # loads the YAML + per-page bootstrap
build.mjs       # deploy-time prerender + redirects from the old site's URLs (run by .github/workflows/deploy.yml)
assets/         # images + CV PDF
```

The only third-party code is `js-yaml`, vendored at `js/vendor/js-yaml.min.js`. `build.mjs` (deploy-time prerender) needs only Node, no packages; the source pages also work unbuilt, rendering everything in the browser.
