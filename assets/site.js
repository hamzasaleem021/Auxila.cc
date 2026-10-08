/* auxila.cc homepage behaviour */
(function () {
  'use strict';

  /* ── Settings ──────────────────────────────────────────────────────
   * DEMOS: where each "Try it here" frame loads its app from. Each demo
   * now lives in this repo under demos/. Once an app repo carries its own
   * demo mode (see README), point its entry at the live app instead, e.g.
   *   ol: { src: 'https://openloops.auxila.cc/open-loops.html?demo=1', ... }
   *
   * SIGNUP: the "Notify me" form saves emails to a Supabase table. Leave
   * url empty until the table exists (README has the SQL). While it is
   * empty, the form says sign-ups are not open yet and sends nothing.
   */
  var DEMOS = {
    ol: { src: 'demos/open-loops/', app: 'https://openloops.auxila.cc' },
    mb: { src: 'demos/morning-brief/', app: 'https://morningbrief.auxila.cc' }
  };
  var SIGNUP = {
    url: '',      // e.g. 'https://YOUR-PROJECT.supabase.co'
    key: '',      // the project's publishable (anon) key
    table: 'release_signups',
    release: 'AUX 003'
  };
  var DEMO_SEED = { olClosed: 3, mbSources: 4 }; // matches the demo-config.js files

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── record sleeves: barcode + flip to the liner notes ─────────────── */
  $$('.barcode').forEach(function (b) {
    var s = 7;
    for (var i = 0; i < 34; i++) {
      s = (s * 9301 + 49297) % 233280;
      var bar = document.createElement('i');
      bar.style.width = (1 + Math.floor(s / 233280 * 3)) + 'px';
      b.appendChild(bar);
    }
  });
  function flip(id) {
    var rel = document.getElementById(id);
    rel.classList.toggle('flip');
    var on = rel.classList.contains('flip');
    $$('[data-flip="' + id + '"]').forEach(function (b) {
      b.setAttribute('aria-pressed', on);
      b.querySelector('span').textContent = on ? 'Show the cover' : 'Read the liner notes';
    });
  }
  $$('[data-flip]').forEach(function (b) { b.addEventListener('click', function () { flip(b.dataset.flip); }); });
  $$('.sleeve.flippable').forEach(function (s) { s.addEventListener('click', function () { flip(s.closest('.rel').id); }); });

  /* ── demo panels ───────────────────────────────────────────────────── */
  function setPanel(id, open) {
    var panel = $('#play-' + id), btn = $('[data-open="' + id + '"]'), rel = $('#r-' + id);
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open);
    btn.querySelector('.lbl').textContent = open ? 'Hide demo' : 'Try it here';
    rel.classList.toggle('playing', open);
  }

  function boot(id, fresh) {
    var frame = $('#frame-' + id), cover = $('#load-' + id);
    if (frame.dataset.booted && !fresh) return;
    frame.dataset.booted = '1';
    cover.classList.remove('gone');
    var msg = cover.querySelector('.pl-msg');
    if (!msg.dataset.label) msg.dataset.label = msg.textContent;
    msg.textContent = msg.dataset.label;
    clearTimeout(frame._auxTimer);
    frame._auxTimer = setTimeout(function () {
      if (!cover.classList.contains('gone')) {
        msg.innerHTML = 'The demo could not start in this browser. <a href="' + DEMOS[id].app + '">Open the real app ↗</a>';
      }
    }, 15000);
    if (fresh) {
      frame.src = 'about:blank';
      setTimeout(function () { frame.src = DEMOS[id].src; }, 40);
    } else {
      frame.src = DEMOS[id].src;
    }
  }

  $$('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.open, open = btn.getAttribute('aria-expanded') !== 'true';
      Object.keys(DEMOS).forEach(function (other) { if (other !== id) setPanel(other, false); });
      setPanel(id, open);
      if (!open) return;
      boot(id);
      var panel = $('#play-' + id);
      requestAnimationFrame(function () {
        var r = panel.getBoundingClientRect();
        if (r.bottom > innerHeight || r.top < 0) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
  });
  $$('[data-close]').forEach(function (x) {
    x.addEventListener('click', function () {
      var id = x.dataset.close, btn = $('[data-open="' + id + '"]');
      setPanel(id, false);
      btn.focus();
      btn.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  });
  $$('[data-reset]').forEach(function (x) {
    x.addEventListener('click', function () { resetSteps(x.dataset.reset); boot(x.dataset.reset, true); });
  });

  /* "Try this" steps tick off from what happens inside the demo */
  function tick(key) {
    var li = $('.tries [data-t="' + key + '"]');
    if (!li || li.classList.contains('done')) return;
    li.classList.add('done');
    var sr = document.createElement('span');
    sr.className = 'vh';
    sr.textContent = ' Done.';
    li.appendChild(sr);
    var list = li.parentElement;
    if (!list.querySelector('li:not(.done)')) {
      var done = list.parentElement.querySelector('.play-done');
      if (done) done.hidden = false;
    }
  }
  function resetSteps(id) {
    $$('#play-' + id + ' .tries li').forEach(function (li) {
      li.classList.remove('done');
      var sr = li.querySelector('.vh');
      if (sr) sr.remove();
    });
    var done = $('#play-' + id + ' .play-done');
    if (done) done.hidden = true;
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !DEMOS[d.auxDemo]) return;
    var frame = $('#frame-' + d.auxDemo);
    if (!frame || e.source !== frame.contentWindow) return;
    if (d.type === 'ready') { $('#load-' + d.auxDemo).classList.add('gone'); return; }

    if (d.auxDemo === 'ol' && d.type === 'storage' && /^open_loops_data_v2:/.test(d.key) && d.value) {
      try {
        var loops = JSON.parse(d.value).loops || [];
        var mine = function (l) { return !/^demo-/.test(l.id); };
        if (loops.some(mine)) tick('ol:capture');
        if (loops.some(function (l) { return (mine(l) || /^demo-i/.test(l.id)) && l.kind && l.status !== 'inbox'; })) tick('ol:define');
        if (loops.filter(function (l) { return l.status === 'released'; }).length > DEMO_SEED.olClosed) tick('ol:close');
      } catch (_) {}
    }
    if (d.auxDemo === 'mb') {
      if (d.type === 'event' && d.name === 'read') tick('mb:read');
      if (d.type === 'event' && d.name === 'cap') tick('mb:cap');
      if (d.type === 'storage' && d.key === 'morning_brief_sources' && d.value) {
        try { if (JSON.parse(d.value).length > DEMO_SEED.mbSources) tick('mb:add'); } catch (_) {}
      }
    }
  });

  /* ── "Notify me" ───────────────────────────────────────────────────── */
  var form = $('#notify'), note = $('#notifyMsg'), input = $('#email');
  if (form) {
    var defaultNote = note.textContent;
    var say = function (text, isError) { note.textContent = text; note.classList.toggle('err', !!isError); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();
      if (form.website && form.website.value) { say("You're on the list."); return; } // bots fill the hidden field
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
        say('That address looks incomplete. Check it and try again.', true);
        input.focus();
        return;
      }
      if (!SIGNUP.url || !SIGNUP.key) { say("Sign-ups aren't open yet. Check back soon."); return; }
      var button = form.querySelector('button');
      button.disabled = true;
      say('Saving…');
      fetch(SIGNUP.url.replace(/\/$/, '') + '/rest/v1/' + SIGNUP.table, {
        method: 'POST',
        headers: { apikey: SIGNUP.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: email, release: SIGNUP.release })
      }).then(function (r) {
        if (r.ok) { form.reset(); say("You're on the list. One email when " + SIGNUP.release + ' ships.'); }
        else if (r.status === 409) { form.reset(); say("You're already on the list."); }
        else { say("That didn't go through. Try again in a minute.", true); }
      }).catch(function () {
        say("That didn't go through. Check your connection and try again.", true);
      }).then(function () { button.disabled = false; });
    });
    input.addEventListener('input', function () { if (note.classList.contains('err')) say(defaultNote); });
  }
})();
