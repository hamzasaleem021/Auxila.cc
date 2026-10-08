/*
 * Auxila demo layer
 * ------------------------------------------------------------------------
 * Runs a real Auxila app in demo mode. Load it as the first script in the
 * app's <head>, right after its demo-config.js:
 *
 *   <script src="demo-config.js"></script>
 *   <script src="demo-layer.js"></script>
 *
 * It reads window.AUX_DEMO_CONFIG and swaps the app's outside connections
 * for offline stand-ins. The app's own code is not changed.
 *
 *   storage   localStorage lives in memory only, seeded with example data
 *   sign-in   a pretend Supabase client with a demo session (optional)
 *   offline   service worker registration is skipped
 *   network   feed requests get example posts; other requests pass through
 *
 * It tells the page that embeds the demo what happens (via postMessage),
 * so the homepage can tick its "Try this" steps. Nothing is saved or sent.
 *
 * Works in two setups:
 *   1. a generated demo page (auxila.cc/demos/<app>/), and
 *   2. later, inside the app repo itself, loaded only when ?demo=1 is set.
 * In setup 2 the real Supabase script still loads; the stand-in below
 * ignores it, so the app keeps using the demo client.
 */
(function () {
  'use strict';
  var D = window.AUX_DEMO_CONFIG;
  if (!D || window.__AUX_DEMO_ON__) return;
  window.__AUX_DEMO_ON__ = true;
  var APP = D.app;
  var embedded = window.parent && window.parent !== window;

  function post(msg) {
    if (!embedded) return;
    try { msg.auxDemo = APP; window.parent.postMessage(msg, '*'); } catch (e) {}
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ── storage: memory only ─────────────────────────────────────────── */
  var mem = new Map();
  Object.keys(D.seed || {}).forEach(function (k) { mem.set(k, String(D.seed[k])); });
  var store = {
    getItem: function (k) { k = String(k); return mem.has(k) ? mem.get(k) : null; },
    setItem: function (k, v) { k = String(k); v = String(v); mem.set(k, v); post({ type: 'storage', key: k, value: v }); },
    removeItem: function (k) { k = String(k); mem.delete(k); post({ type: 'storage', key: k, value: null }); },
    clear: function () { mem.clear(); },
    key: function (i) { var a = Array.from(mem.keys()); return i < a.length ? a[i] : null; },
    get length() { return mem.size; }
  };
  try { Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return store; } }); } catch (e) {}

  /* ── no service worker ────────────────────────────────────────────── */
  var never = new Promise(function () {});
  var sw = {
    register: function () { return never; },
    getRegistration: function () { return Promise.resolve(undefined); },
    getRegistrations: function () { return Promise.resolve([]); },
    addEventListener: function () {}, removeEventListener: function () {},
    controller: null, ready: never
  };
  try { Object.defineProperty(navigator, 'serviceWorker', { configurable: true, get: function () { return sw; } }); } catch (e) {}

  /* ── feeds (Morning Brief) ────────────────────────────────────────── */
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rss(title, link, items) {
    return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' + xml(title) + '</title><link>' + xml(link) + '</link>' +
      items.map(function (it) {
        return '<item><title>' + xml(it.title) + '</title><link>' + xml(it.link) + '</link><description>' + xml(it.desc) +
          '</description><pubDate>' + new Date(Date.now() - (it.h || 0) * 3600e3 - 60e3).toUTCString() + '</pubDate></item>';
      }).join('') + '</channel></rss>';
  }
  var names = null;
  function loadNames() {
    if (names) return Promise.resolve(names);
    names = {};
    try {
      var C = window.MB_CONFIG || {};
      (C.STARTER_PACK || []).forEach(function (s) { names[s.url] = s.name; });
      (C.BUNDLES || []).forEach(function (b) { (b.sources || []).forEach(function (s) { names[s.url] = s.name; }); });
    } catch (e) {}
    if (!realFetch || !D.catalogue) return Promise.resolve(names);
    return realFetch(D.catalogue).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var c = (j && j.categories) || {};
      Object.keys(c).forEach(function (k) { c[k].forEach(function (s) { if (!names[s.url]) names[s.url] = s.name; }); });
      return names;
    }).catch(function () { return names; });
  }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'this source'; } }
  function rssResponse(body) { return new Response(body, { status: 200, headers: { 'Content-Type': 'application/rss+xml' } }); }
  function placeholder(feedUrl) {
    return loadNames().then(function (n) {
      var nm = n[feedUrl] || hostOf(feedUrl);
      return rssResponse(rss(nm, D.appUrl || '#', [{
        title: 'Live posts from ' + nm + ' load in the real app',
        link: D.appUrl || '#',
        desc: D.liveFeeds
          ? 'This demo could not reach ' + nm + ' just now. Open the app to read it for real.'
          : 'This demo only carries example sources. Open the app to read ' + nm + ' for real.',
        h: 0 }]));
    });
  }
  function liveFeed(url) {
    if (!realFetch) return Promise.reject(new Error('no fetch'));
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    return realFetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('status ' + r.status);
      return r.text();
    }).then(function (text) {
      if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(text)) throw new Error('not a feed');
      return rssResponse(text);
    });
  }
  if (realFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || String(input);
      if (D.proxy && url.indexOf(D.proxy) === 0) {
        var feed = decodeURIComponent(url.slice(D.proxy.length));
        var fx = (D.feeds || {})[feed];
        if (fx) return wait(220 + Math.random() * 520).then(function () { return rssResponse(rss(fx.title, fx.link, fx.items)); });
        if (D.liveFeeds) return liveFeed(url).catch(function () { return placeholder(feed); });
        return wait(300).then(function () { return placeholder(feed); });
      }
      return realFetch(input, init);
    };
  }

  /* ── a pretend Supabase backend, in memory ────────────────────────── */
  var now = Date.now();
  var tables = {};
  if (D.loops) {
    tables.loops = D.loops.map(function (l) {
      var created = new Date(now - (l.age || 1) * 3600e3).toISOString();
      return {
        id: l.id, user_id: 'demo-user', raw_text: l.text, kind: l.kind || null, status: l.status, prompt_answer: l.answer || '',
        position: now / 1000 - (l.pos || 0), created_at: created, updated_at: created,
        completed_at: l.done != null ? new Date(now - l.done * 3600e3).toISOString() : null, deleted_at: null
      };
    });
  }
  var session = D.session || null;
  var listeners = [];
  function res(data, extra) { var r = { data: data, error: null, count: null, status: 200 }; for (var k in (extra || {})) r[k] = extra[k]; return r; }
  function Q(t) { this.t = t; this.op = 'select'; this.f = []; this.ord = null; this.p = null; this.o = {}; this.one = false; this.maybe = false; this.lim = null; this.after = false; }
  Q.prototype.select = function (c, o) { if (this.op === 'select') this.o = o || {}; else this.after = true; return this; };
  Q.prototype.insert = function (p) { this.op = 'upsert'; this.p = p; return this; };
  Q.prototype.upsert = function (p) { this.op = 'upsert'; this.p = p; return this; };
  Q.prototype.update = function (p) { this.op = 'update'; this.p = p; return this; };
  Q.prototype['delete'] = function () { this.op = 'delete'; return this; };
  ['eq', 'neq', 'is', 'in', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'match', 'filter', 'not', 'or', 'contains'].forEach(function (m) {
    Q.prototype[m] = function (c, v) { this.f.push([m, c, v]); return this; };
  });
  Q.prototype.order = function (c, o) { this.ord = [c, o && o.ascending === false ? -1 : 1]; return this; };
  Q.prototype.limit = function (n) { this.lim = n; return this; };
  Q.prototype.range = function () { return this; };
  Q.prototype.abortSignal = function () { return this; };
  Q.prototype.single = function () { this.one = true; return this; };
  Q.prototype.maybeSingle = function () { this.maybe = true; return this; };
  Q.prototype.then = function (a, b) { var self = this; return wait(60).then(function () { return self.run(); }).then(a, b); };
  Q.prototype.run = function () {
    var rows = tables[this.t] = tables[this.t] || [];
    var f = this.f;
    function hit(r) {
      return f.every(function (q) {
        var op = q[0], c = q[1], v = q[2];
        if (op === 'eq') return r[c] === v;
        if (op === 'neq') return r[c] !== v;
        if (op === 'is') return v === null ? r[c] == null : r[c] === v;
        if (op === 'in') return (v || []).indexOf(r[c]) >= 0;
        return true;
      });
    }
    var stamp = new Date().toISOString();
    if (this.op === 'select') {
      var out = rows.filter(hit);
      if (this.ord) { var c = this.ord[0], d = this.ord[1]; out = out.slice().sort(function (a, b) { return (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * d; }); }
      if (this.lim != null) out = out.slice(0, this.lim);
      if (this.o.head) return res(null, { count: out.length });
      out = out.map(function (r) { return Object.assign({}, r); });
      if (this.one || this.maybe) return res(out[0] || null);
      return res(out, { count: this.o.count ? out.length : null });
    }
    if (this.op === 'upsert') {
      var list = Array.isArray(this.p) ? this.p : [this.p];
      list.forEach(function (p) {
        var i = rows.findIndex(function (r) { return r.id === p.id; });
        var row = Object.assign({}, i >= 0 ? rows[i] : { deleted_at: null, completed_at: null }, p, { updated_at: stamp });
        if (i >= 0) rows[i] = row; else rows.push(row);
      });
      return res(this.after ? list : null);
    }
    if (this.op === 'update') {
      var p = this.p, changed = rows.filter(hit);
      changed.forEach(function (r) { Object.assign(r, p, { updated_at: stamp }); });
      var ids = changed.map(function (r) { return { id: r.id }; });
      if (this.one || this.maybe) return res(ids[0] || null);
      return res(this.after ? ids : null);
    }
    if (this.op === 'delete') { tables[this.t] = rows.filter(function (r) { return !hit(r); }); return res(null); }
    return res(null);
  };
  var client = {
    auth: {
      getSession: function () { return Promise.resolve({ data: { session: session }, error: null }); },
      getUser: function () { return Promise.resolve({ data: { user: session && session.user }, error: null }); },
      onAuthStateChange: function (cb) { listeners.push(cb); return { data: { subscription: { unsubscribe: function () {} } } }; },
      signInWithOtp: function () {
        // In the demo, "check your email" is followed by signing straight back in.
        if (D.signInAs) setTimeout(function () { session = D.signInAs; listeners.forEach(function (cb) { try { cb('SIGNED_IN', session); } catch (e) {} }); }, 1400);
        return Promise.resolve({ data: {}, error: null });
      },
      signOut: function () {
        session = null;
        setTimeout(function () { listeners.forEach(function (cb) { try { cb('SIGNED_OUT', null); } catch (e) {} }); }, 0);
        return Promise.resolve({ error: null });
      },
      refreshSession: function () { return Promise.resolve({ data: { session: session }, error: null }); }
    },
    from: function (t) { return new Q(t); },
    rpc: function (name, params) {
      if (name === 'batch_upsert_loops' && params && params.p_loops) {
        var q = new Q('loops');
        q.upsert(params.p_loops.map(function (l) {
          return { id: l.id, user_id: 'demo-user', raw_text: l.rawText || '', kind: l.kind || null, status: l.status || 'active',
            prompt_answer: l.promptAnswer || '', position: l.position, created_at: l.createdAt };
        }));
        q.run();
      }
      return wait(60).then(function () { return res(null); });
    },
    channel: function () {
      var ch = {
        on: function () { return ch; },
        subscribe: function (cb) { setTimeout(function () { try { cb && cb('SUBSCRIBED'); } catch (e) {} }, 40); return ch; },
        unsubscribe: function () { return Promise.resolve('ok'); },
        send: function () { return Promise.resolve('ok'); }
      };
      return ch;
    },
    removeChannel: function () { return Promise.resolve('ok'); },
    removeAllChannels: function () { return Promise.resolve([]); },
    realtime: { setAuth: function () {} }
  };
  var stand_in = { createClient: function () { return client; } };
  // If the real Supabase script loads after this file, its assignment is ignored.
  try { Object.defineProperty(window, 'supabase', { configurable: false, get: function () { return stand_in; }, set: function () {} }); }
  catch (e) { window.supabase = stand_in; }

  /* ── Morning Brief: example posts stay in the demo; report the limit ─ */
  if (APP === 'mb') {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var h = a.getAttribute('href') || '';
      var isPost = a.classList.contains('article-item') || a.classList.contains('article-featured');
      if (/^https:\/\/[a-z0-9-]+\.example\//.test(h)) {
        e.preventDefault();
        post({ type: 'event', name: 'read' });
        try { if (typeof UI !== 'undefined' && UI.toast) UI.toast('Example post. In the app, this opens the original article.'); } catch (_) {}
      } else if (isPost) {
        post({ type: 'event', name: 'read' });
      }
    }, true);
    var capOpen = false;
    new MutationObserver(function () {
      var v = document.getElementById('mb-voucher');
      var on = !!(v && v.classList.contains('visible'));
      if (on && !capOpen) post({ type: 'event', name: 'cap' });
      capOpen = on;
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('load', function () { post({ type: 'ready' }); });
})();
