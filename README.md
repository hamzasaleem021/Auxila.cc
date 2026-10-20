# auxila.cc

The one-page site for Auxila, served by GitHub Pages at <https://auxila.cc>.

## What's in here

```
index.html              the homepage
assets/site.css         styles
assets/site.js          sleeve flip and "Notify me" (settings at the top)
favicon.svg             browser icon
apple-touch-icon.png    home-screen icon
og.png                  share image (1200 × 630)
me.jpg                  photo in the studio section
robots.txt, sitemap.xml
CNAME                   auxila.cc (GitHub Pages custom domain)
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
      `https://morningbrief.auxila.cc`.
- [ ] The "Source on GitHub" links in `index.html` point at the right repos.
- [ ] "Notify me" set up (above), or left as is until AUX 003 is closer.
