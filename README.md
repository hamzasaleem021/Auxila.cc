# auxila.cc

The one-page site for Auxila, served by GitHub Pages at <https://auxila.cc>.

## What's in here

```
index.html              the homepage
assets/site.css         styles
assets/site.js          sleeve flip, demo panels, "Notify me" (settings at the top)
favicon.svg             browser icon
apple-touch-icon.png    home-screen icon
og.png                  share image (1200 × 630)
me.jpg                  photo in the studio section
robots.txt, sitemap.xml
CNAME                   auxila.cc (GitHub Pages custom domain)

demos/
  demo-layer.js         shared demo mode (see below)
  open-loops/           the real Open Loops page, generated + demo-config.js
  morning-brief/        the real Morning Brief page, generated + demo-config.js + demo-fixes.css
tools/
  build-demos.py        regenerates the two demo folders from the app repos
```

## How the "Try it here" demos work

"Try it here" opens `demos/<app>/` in a phone frame. That page is the app's own
HTML with two scripts added at the top of `<head>`:

- `demo-config.js`: the example data (loops, sources, example posts).
- `demo-layer.js`: stand-ins for the app's outside connections. Storage lives
  in memory, sign-in is a pretend session, the service worker is skipped, and
  feed requests get example posts.

The app code itself is unchanged, and nothing is saved or sent. The layer tells
the homepage what happens inside the app, so the "Try this" steps tick off.

## When an app changes

Pull the latest app repos next to this one, then run:

```
python3 tools/build-demos.py --open-loops ../open-loops --morning-brief ../morning-brief
```

Commit the `demos/` folder. The script never overwrites `demo-config.js`,
`demo-fixes.css` or `demo-layer.js`.

## Moving a demo into its app repo later

This removes the copy here, so the demo always matches the live app.

1. Copy `demos/demo-layer.js` and `demos/<app>/demo-config.js` into the app
   repo, next to the app's page.
2. In the app's page, add this line right after `<meta charset>`:

   ```html
   <script>if (/[?&]demo=1(&|$)/.test(location.search)) document.write('<script src="demo-config.js"><\/script><script src="demo-layer.js"><\/script>');</script>
   ```

   Without `?demo=1` the app behaves exactly as before. With it, the app runs
   in demo mode. The real Supabase script still loads, but the layer keeps it
   out of the way.
3. In `assets/site.js`, point `DEMOS` at the live app, e.g.
   `src: 'https://openloops.auxila.cc/open-loops.html?demo=1'`.
4. Delete `demos/<app>/` here. Once both apps have moved, delete `demos/` and
   `tools/` too.

## A Morning Brief bug the demo works around

On phones, "Sign in to sync" and the theme button overlap the "Personal
Intelligence Brief" line at the top. `demos/morning-brief/demo-fixes.css`
fixes it for the demo only. Add the same rule to `morning-brief.html` in that
repo, then delete `demo-fixes.css` here and rebuild:

```css
@media (max-width: 699px) { .masthead { padding-top: 56px; } }
```

## Turning on "Notify me"

Until this is set up, the form says sign-ups aren't open yet and sends nothing.

1. In a Supabase project (an existing one is fine), open the SQL editor and run:

   ```sql
   create table if not exists public.release_signups (
     id         bigint generated always as identity primary key,
     email      text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
     release    text not null default 'AUX 003' check (length(release) <= 40),
     created_at timestamptz not null default now()
   );
   create unique index if not exists release_signups_unique
     on public.release_signups (lower(email), release);
   alter table public.release_signups enable row level security;
   create policy "Anyone can sign up" on public.release_signups
     for insert to anon with check (true);
   -- No read, update or delete policies, so the list can't be read from the site.
   ```

2. In `assets/site.js`, fill in `SIGNUP.url` (Project URL) and `SIGNUP.key`
   (the publishable key) from Project Settings → API. The publishable key is
   safe to ship in a web page; the policy above only allows adding a row.
3. Sign-ups appear in Table Editor → `release_signups`.

## Before launch

- [ ] DNS at GoDaddy: `openloops` and `morningbrief` CNAME records pointing to
      `hamzasaleem021.github.io`, and the custom domain set in each app repo's
      Pages settings.
- [ ] Supabase Auth → URL Configuration: add `https://openloops.auxila.cc` and
      `https://morningbrief.auxila.cc` to Redirect URLs (both projects).
- [ ] The Morning Brief proxy (Cloudflare Worker) accepts requests from
      `https://morningbrief.auxila.cc`. If it also accepts `https://auxila.cc`,
      feeds added in the demo load for real; otherwise the demo shows a short
      placeholder for them.
- [ ] The "Source on GitHub" links in `index.html` point at the right repos.
- [ ] "Notify me" set up (above), or left as is until AUX 003 is closer.
