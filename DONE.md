# Done

## What Was Built

LearnBridge is a web app that teaches CBSE 5th grade algebra to children (ages 10–11) studying alone after school. It delivers illustrated step-by-step walkthroughs, an adaptive 4-level quiz engine with stuck detection, and WhatsApp alerts to the parent when the child exhausts every retry path — with a subsection-specific coaching guide inline in the message. A progress dashboard shows session history, quiz scores, and alert history.

Built on Next.js 14 (App Router) + Supabase + Vercel. 17 Linear tasks completed across Phase 1 and Phase 2.

---

## Completed Features

| Feature | Implementation |
|---|---|
| **Illustrated Step-by-Step Walkthroughs** | `/learn/[topicSlug]/[subsectionSlug]` — `WalkthroughViewer` renders steps with images, manual advance, "Start Quiz" button at end |
| **Adaptive Quiz Engine (4-level, 6 paths)** | `quiz-state-machine.ts` — pure state machine covering all 6 PRD progression paths (L3→L4, L3→fallback→retry, stuck conditions); unit tested with Vitest |
| **Stuck Detection** | Embedded in level progression — triggers after failing L3 retry (post-fallback) or L4 retry; calls `/api/alerts/send` immediately |
| **Parent WhatsApp Alert** | `POST /api/alerts/send` → Meta Cloud API v19.0 template message; writes to `alerts_sent` table; includes child name, subsection, coaching guide, dashboard link |
| **Subsection-Specific Coaching Prompts** | `subsections.coaching_guide` field stored per subsection; fetched and sent as template parameter in every stuck alert |
| **Progress Dashboard** | `/dashboard` — sessions completed per subsection, quiz score % by topic, alert history; protected route |
| **Auth + Signup** | Supabase Auth (email/password); signup captures parent email, WhatsApp number, child name; WhatsApp verification message sent on signup; middleware protects `/learn` and `/dashboard` |
| **Full CBSE 5th Algebra Content** | 3 chapters seeded — patterns, unknowns, simple equations — with walkthrough steps, L1–L4 questions per subsection, and coaching guides |
| **Topic/Subsection Navigation** | `/learn` index listing chapters and subsections with completion/progress indicators |
| **Session Completion Tracking** | `sessions` table tracks outcomes (completed/stuck/abandoned); last-visited subsection persisted |
| **Responsive Tablet Layout** | Tailwind breakpoints at 768px+; tablet-friendly for children on shared devices |

---

## What's Next

Phase 3+ items from BUILD_PLAN.md — none of these are in scope until Phase 2 is validated with real users:

- **Subscription + payment** — Razorpay integration, monthly ₹299–499 subscription, 7-day free trial
- **Two-way WhatsApp loop** — parent marks issue resolved, child unlocks next stage
- **AI coaching prompts** — dynamic per-subsection coaching instead of pre-written guides
- **CMS for content** — in-app editing of walkthroughs, questions, and coaching guides without re-seeding
- **Other subjects / grades** — expand beyond CBSE 5th algebra
- **Native mobile app** — iOS/Android for child
- **Admin dashboard** — usage analytics, alert monitoring
- **SMS fallback** — if WhatsApp delivery fails

---

## Metrics Readiness

| Success Metric | Tracking Status |
|---|---|
| % of sessions completed without parent alert | **Measurable now** — `sessions.outcome` ('completed' vs 'stuck') is recorded per session. Query: `sessions WHERE outcome = 'completed' / total sessions`. |
| Quiz score improvement per topic across attempts | **Measurable now** — `question_attempts.correct` stored per answer per session. Score % over time queryable by `subsection_id` and `created_at`. Dashboard already surfaces this. |
| Parent WhatsApp response rate + response time | **Partially trackable** — `alerts_sent` records when alerts are sent. Response tracking requires the WhatsApp webhook to record parent replies (the verification webhook exists; extending it to log coaching replies is Phase 3). |
| Week-4 subscription retention rate | **Not yet trackable** — no subscription system exists. Requires Razorpay integration (Phase 3) to track payment renewal. |
| Average sessions per week per child | **Measurable now** — `sessions.created_at` + `sessions.family_id` allow weekly aggregation per family. No dashboard widget yet; raw query works. |

---

## Linear

Project: https://linear.app/inoon/project/learnbridge-fe7ffda791a4
Tasks completed: 17 / 17 (INO-5 through INO-21)

---

## Handoff Notes

- **WhatsApp template approval** — The Meta Cloud API template (`learnbridge_stuck_alert`) must be approved before alerts fire in production. If not yet approved, the `/api/alerts/send` endpoint will return a Meta API error. Check Meta Business Manager → WhatsApp → Message Templates.
- **Environment variables required** — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, `NEXT_PUBLIC_APP_URL`. All must be set in Vercel for production.
- **No payment system** — There is no subscription gate. Anyone who signs up can access the full app. Add Razorpay before public launch.
- **Content is seeded, not CMS-managed** — Walkthrough steps, questions, and coaching guides live in the Supabase DB (seeded via `scripts/seed.ts`). Editing content requires re-running the seed or direct DB edits until a CMS is built.
- **Single shared family account** — One login per family. The child and parent use the same credentials. No separate parent/child role system.
- **Test coverage** — Quiz state machine has full unit test coverage (all 6 paths). Auth, API routes, and dashboard are not unit tested — integration/E2E tests are a Phase 3 addition.
