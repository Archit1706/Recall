# Recall — backlog & ideas

Free retention boosters worth considering, beyond the locked spec.

## Done / planned in v1

- [ ] Capture: text/link/PDF/markdown/code with smart detection
- [ ] Capture: PWA share target from phone share sheet
- [ ] Review: FLIP / TYPE / RECALL_BUTTONS / AI_QUIZ modes
- [ ] FSRS scheduling (ts-fsrs)
- [ ] Tags, full-text search, stats
- [ ] Email digest (Resend) + web push (VAPID)
- [ ] Daily Vercel Cron with timezone-aware filtering
- [ ] AI: summary, 3 Q&A pairs, key concepts, AI quiz grader
- [ ] Streak + GitHub-style heatmap
- [ ] Random refresher (combat interference)
- [ ] Import (URLs / markdown) + Export (JSON, Anki .apkg)
- [ ] Cram mode (FSRS bypass)
- [ ] Connections (related items prompt)
- [ ] Elaboration prompt every 5th review
- [ ] Quick-add via URL params
- [ ] Offline review (service worker)
- [ ] Dark mode, mobile-first, full keyboard shortcuts

## Future / open ideas

- **Spaced reading mode** — for long-form articles: extract paragraphs and schedule them as separate cards on a delay.
- **Cloze deletion** — `{{c1::word}}` syntax in markdown items auto-generates fill-in-the-blank cards.
- **Audio capture** — voice memo → on-device Whisper-tiny → text card. (Only if the WASM model fits.)
- **Calendar integration** — show due review load on Google Calendar (.ics feed).
- **Browser extension** — one-click "remember this page" from any URL, syncs into the same account.
- **Collaboration (read-only)** — share a public link to a tag of items. Free, just rate-limited.
- **AI distillation digest** — once a week, Claude summarizes "what you've learned in 7 days" into a paragraph.
- **Mnemonic generator** — for vocab/names, AI suggests a memorable image or sentence.
- **Pomodoro-style review** — set a 5-minute timer, app stops cards when time's up to keep sessions short.
- **Reverse cards** — for definitions / vocabulary, auto-create the inverse card.
- **Difficulty heat-list** — items where the lapse count is creeping up get surfaced for re-encoding (rewrite the note in your own words).
- **Inbox** — capture without a title; nightly "triage" prompt asks you to title and tag.
- **Source autoplay** — if the item is a YouTube URL, play the relevant segment inline on review.
