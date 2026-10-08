/*
 * Open Loops demo: example data.
 * Read by ../demo-layer.js (or ./demo-layer.js once this lives in the app repo).
 *
 *   seed    localStorage values the app reads on start
 *           (onboarding done, focus cap 3, night theme)
 *   loops   example loops served by the pretend Supabase backend.
 *           status: inbox | active | waiting (Parked) | released (Closed)
 *           age = hours since captured, pos = order (lower = higher up),
 *           done = hours since closed
 *
 * Edit freely. Nothing here is saved anywhere.
 */
window.AUX_DEMO_CONFIG = {
  "app": "ol",
  "appUrl": "https://openloops.auxila.cc",
  "session": {
    "user": {
      "id": "demo-user",
      "email": "demo@auxila.cc"
    },
    "access_token": "demo"
  },
  "signInAs": {
    "user": {
      "id": "demo-user",
      "email": "demo@auxila.cc"
    },
    "access_token": "demo"
  },
  "seed": {
    "open_loops_data_onboarded:demo-user": "1",
    "open_loops_data_cap:demo-user": "3",
    "open_loops_data_theme": "dark"
  },
  "loops": [
    {
      "id": "demo-a1",
      "text": "Confirm the meeting time with Sarah",
      "kind": "ask",
      "status": "active",
      "answer": "Sarah, for a yes on Thursday",
      "age": 50,
      "pos": 10
    },
    {
      "id": "demo-a2",
      "text": "Pick a direction for the homepage",
      "kind": "decide",
      "status": "active",
      "answer": "Draft A or draft B",
      "age": 70,
      "pos": 20
    },
    {
      "id": "demo-a3",
      "text": "Reply to the contractor quote",
      "kind": "do",
      "status": "active",
      "answer": "Send back the revised scope",
      "age": 26,
      "pos": 30
    },
    {
      "id": "demo-a4",
      "text": "Book the annual check-up",
      "kind": "schedule",
      "status": "active",
      "answer": "A call to the clinic, Monday at 9",
      "age": 96,
      "pos": 40
    },
    {
      "id": "demo-i1",
      "text": "Renew the domain before it lapses",
      "status": "inbox",
      "age": 3,
      "pos": 5
    },
    {
      "id": "demo-i2",
      "text": "Look into a standing desk",
      "status": "inbox",
      "age": 20,
      "pos": 6
    },
    {
      "id": "demo-w1",
      "text": "Redo the portfolio site",
      "kind": "do",
      "status": "waiting",
      "answer": "Outline the two case studies",
      "age": 216,
      "pos": 50
    },
    {
      "id": "demo-r1",
      "text": "Send the invoice to the client",
      "kind": "do",
      "status": "released",
      "answer": "Attach the timesheet and send",
      "age": 30,
      "pos": 60,
      "done": 2
    },
    {
      "id": "demo-r2",
      "text": "Decide on the conference trip",
      "kind": "decide",
      "status": "released",
      "answer": "Go, or skip it this year",
      "age": 60,
      "pos": 70,
      "done": 5
    },
    {
      "id": "demo-r3",
      "text": "Learn a third language this year",
      "kind": "let_go",
      "status": "released",
      "age": 400,
      "pos": 80,
      "done": 1
    }
  ]
};
