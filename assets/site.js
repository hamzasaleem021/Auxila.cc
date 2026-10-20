/* auxila.cc homepage behaviour */
(function () {
  'use strict';

  /* ── Settings ──────────────────────────────────────────────────────
   * SIGNUP: the "Notify me" form saves emails to a Supabase table. Leave
   * url empty until the table exists (README has the SQL). While it is
   * empty, the form says sign-ups are not open yet and sends nothing.
   */
  var SIGNUP = {
    url: '',      // e.g. 'https://YOUR-PROJECT.supabase.co'
    key: '',      // the project's publishable (anon) key
    table: 'release_signups',
    release: 'AUX 003'
  };

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
