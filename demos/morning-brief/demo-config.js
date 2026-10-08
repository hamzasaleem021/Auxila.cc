/*
 * Morning Brief demo: example data.
 * Read by ../demo-layer.js (or ./demo-layer.js once this lives in the app repo).
 *
 *   seed       localStorage values the app reads on start
 *              (four example sources, night theme)
 *   feeds      example posts for those sources (".example" addresses are
 *              reserved for examples, so they never point at a real site).
 *              h = hours ago.
 *   liveFeeds  true: feeds added from Discover are fetched for real through
 *              the app's proxy; if that fails, a short placeholder shows.
 *   catalogue  the app's own catalogue file, used to name sources.
 *
 * Edit freely. Nothing here is saved anywhere.
 */
window.AUX_DEMO_CONFIG = {
  "app": "mb",
  "appUrl": "https://morningbrief.auxila.cc",
  "session": null,
  "seed": {
    "morning_brief_sources": "[{\"id\": \"src_demo_fieldnotes\", \"name\": \"Field Notes\", \"domain\": \"fieldnotes.example\", \"rss\": \"https://fieldnotes.example/feed.xml\", \"colorIndex\": 0}, {\"id\": \"src_demo_pitchside\", \"name\": \"Pitchside\", \"domain\": \"pitchside.example\", \"rss\": \"https://pitchside.example/feed.xml\", \"colorIndex\": 1}, {\"id\": \"src_demo_plainledger\", \"name\": \"The Plain Ledger\", \"domain\": \"plainledger.example\", \"rss\": \"https://plainledger.example/feed.xml\", \"colorIndex\": 2}, {\"id\": \"src_demo_smalltype\", \"name\": \"Small Type\", \"domain\": \"smalltype.example\", \"rss\": \"https://smalltype.example/feed.xml\", \"colorIndex\": 3}]",
    "morning_brief_order": "[\"src_demo_fieldnotes\", \"src_demo_pitchside\", \"src_demo_plainledger\", \"src_demo_smalltype\"]",
    "morning_brief_theme": "dark"
  },
  "proxy": "https://morning-brief-proxy.hamzasaleem021.workers.dev/?url=",
  "liveFeeds": true,
  "catalogue": "discovery-sources.json",
  "feeds": {
    "https://fieldnotes.example/feed.xml": {
      "title": "Field Notes",
      "link": "https://fieldnotes.example/",
      "items": [
        {
          "title": "A year of shipping small things",
          "link": "https://fieldnotes.example/a-year-of-shipping-small-things",
          "desc": "What changed when every project had to fit inside a weekend, and why the scope cuts turned out to be the best part.",
          "h": 2
        },
        {
          "title": "The case for boring software",
          "link": "https://fieldnotes.example/the-case-for-boring-software",
          "desc": "Fewer moving parts, fewer 3 a.m. surprises. A short defence of tools that do one job and then stop.",
          "h": 9
        },
        {
          "title": "Notes on writing changelogs people read",
          "link": "https://fieldnotes.example/notes-on-writing-changelogs-people-read",
          "desc": "Lead with what the reader can now do. Put the version number last. Cut the adjectives.",
          "h": 26
        },
        {
          "title": "What a settings page says about a team",
          "link": "https://fieldnotes.example/what-a-settings-page-says-about-a-team",
          "desc": "Every toggle is a decision someone did not want to make. A tour of the usual suspects.",
          "h": 50
        },
        {
          "title": "Shipping on a Friday, defended",
          "link": "https://fieldnotes.example/shipping-on-a-friday-defended",
          "desc": "If you cannot ship on a Friday, the problem is not Friday.",
          "h": 98
        }
      ]
    },
    "https://pitchside.example/feed.xml": {
      "title": "Pitchside",
      "link": "https://pitchside.example/",
      "items": [
        {
          "title": "Why the short ball still works",
          "link": "https://pitchside.example/why-the-short-ball-still-works",
          "desc": "Field placings across recent series suggest batters are still guessing. The numbers, and what they leave out.",
          "h": 1
        },
        {
          "title": "Spin in the powerplay is here to stay",
          "link": "https://pitchside.example/spin-in-the-powerplay-is-here-to-stay",
          "desc": "Captains are bowling it earlier and the economy rates back them up.",
          "h": 6
        },
        {
          "title": "The quiet rise of the finisher",
          "link": "https://pitchside.example/the-quiet-rise-of-the-finisher",
          "desc": "Strike rates in the last four overs, explained without a single chart.",
          "h": 28
        },
        {
          "title": "What a dry pitch does to a run chase",
          "link": "https://pitchside.example/what-a-dry-pitch-does-to-a-run-chase",
          "desc": "Scoring patterns after the 30th over on surfaces that grip and turn.",
          "h": 52
        },
        {
          "title": "In defence of the forward defence",
          "link": "https://pitchside.example/in-defence-of-the-forward-defence",
          "desc": "Old technique, new value. Why the most boring shot in the game is having a moment.",
          "h": 75
        }
      ]
    },
    "https://plainledger.example/feed.xml": {
      "title": "The Plain Ledger",
      "link": "https://plainledger.example/",
      "items": [
        {
          "title": "Pricing pages that answer the question",
          "link": "https://plainledger.example/pricing-pages-that-answer-the-question",
          "desc": "Most hide the one number people came for. A look at the ones that put it first.",
          "h": 3
        },
        {
          "title": "How small teams pick a market",
          "link": "https://plainledger.example/how-small-teams-pick-a-market",
          "desc": "Start narrow enough to be the obvious choice, then earn the right to widen.",
          "h": 12
        },
        {
          "title": "Positioning, without the jargon",
          "link": "https://plainledger.example/positioning-without-the-jargon",
          "desc": "Say who it is for and what it replaces. Everything else is decoration.",
          "h": 30
        },
        {
          "title": "The real cost of a free plan",
          "link": "https://plainledger.example/the-real-cost-of-a-free-plan",
          "desc": "Support tickets, server bills and the users who never convert.",
          "h": 74
        },
        {
          "title": "Why annual billing changes behaviour",
          "link": "https://plainledger.example/why-annual-billing-changes-behaviour",
          "desc": "Customers who pay once a year use the product differently. Here is how.",
          "h": 120
        }
      ]
    },
    "https://smalltype.example/feed.xml": {
      "title": "Small Type",
      "link": "https://smalltype.example/",
      "items": [
        {
          "title": "The return of the serif",
          "link": "https://smalltype.example/the-return-of-the-serif",
          "desc": "Interfaces are warming up again. Why screens can finally carry the detail.",
          "h": 5
        },
        {
          "title": "Designing for one hand",
          "link": "https://smalltype.example/designing-for-one-hand",
          "desc": "Thumbs decide where buttons should go. Most apps still forget.",
          "h": 22
        },
        {
          "title": "Dark mode is a different design",
          "link": "https://smalltype.example/dark-mode-is-a-different-design",
          "desc": "Inverting colours is not a theme. Notes on contrast, shadow and accent colour at night.",
          "h": 47
        },
        {
          "title": "Whitespace is not empty",
          "link": "https://smalltype.example/whitespace-is-not-empty",
          "desc": "Space does the work of grouping, pacing and calm. How to spend it well.",
          "h": 70
        },
        {
          "title": "The best icon is a word",
          "link": "https://smalltype.example/the-best-icon-is-a-word",
          "desc": "When in doubt, label it. A short case against mystery navigation.",
          "h": 140
        }
      ]
    }
  }
};
