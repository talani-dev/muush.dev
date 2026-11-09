# Data model · Feature 51 `faq_content`

All copy lives in `i18n/locales/{es,en}.json` (Article VI). `data/` holds
only structure: ids, order, key paths, destinations. Module path
`app/features/faq/` (OQ-3 = A, Constitution 2.1.5).

## 1 · Locale keys (both files, identical shape)

```text
pages.faq.title                       "Preguntas frecuentes · muush" | "Frequently asked questions · muush"
pages.faq.description                 meta.description of the JSON
faq.pill                              "Preguntas" | "FAQ"
faq.heading.first / faq.heading.second  "Preguntas" / "frecuentes." | "Frequently asked" / "questions."
faq.subtitle                          encabezado.bajada
faq.tabsLabel                         accessible name of the tab list (new, see note)
faq.links.privacy                     "Aviso de privacidad" | "Privacy notice"
faq.links.about                       "Nosotros" | "About"
faq.card.title                        tarjeta.titulo
faq.card.text                         "Escríbenos a {email} o agenda una llamada de 30 minutos." | "Write to {email} or book a 30-minute call."
faq.card.button                       "Agenda una llamada" | "Book a call"
faq.topics.<n>.title                  n = t1…t5, temas[i].titulo
faq.topics.<n>.questions.<m>.question
faq.topics.<n>.questions.<m>.answer   with {privacy} / {about} / {email} where the JSON has a link
shell.nav.faq                         "Preguntas" | "FAQ"   (OQ-2 = A; `muush-1.0.md` § 4.1)
```

Removed: `shell.faq.title`, `shell.faq.assessment`, `shell.faq.call`.

Placeholders, per locale (from the JSON `enlaces` and README):

| Topic / question | ES answer placeholder | EN answer placeholder |
|---|---|---|
| t4 q3 (confidencialidad) | `…nuestro {privacy}.` | `…our {privacy}.` |
| t5 q1 (talent pool) | `…la página {about} con…` | `…the {about} page with…` |
| t5 q2 (= question 19) | `…escríbenos a {email}.` | `…write to {email}.` |

Rendered with the placeholders filled, every answer equals the JSON
`respuesta` exactly (tested).

Note: `faq.tabsLabel` is not in the approved JSON. Proposal "Temas" /
"Topics"; it is only read by screen readers. Reported to the leader as new
copy needing approval at the gate (non-visible).

## 2 · Structure (`data/faqTopics.ts`)

```ts
interface FaqLink { placeholder: 'privacy' | 'about'; labelKey: string; destination: { name: 'privacy' } | { name: 'about'; anchor: 'trabaja-con-muush' } }
interface FaqQuestion { questionKey: string; answerKey: string; links?: FaqLink[]; email?: true }
interface FaqTopic { key: 't1'|'t2'|'t3'|'t4'|'t5'; number: '01'…'05'; anchor: { es: string; en: string }; trackingId: FaqTopicId; titleKey: string; questions: FaqQuestion[] }
export const FAQ_TOPICS: readonly FaqTopic[]   // 5 topics, 5/5/4/3/3 questions = 20
```

Anchors: `t1 diagnostico|assessment`, `t2 precios|pricing`,
`t3 proceso|process`, `t4 entrega|delivery`,
`t5 trabaja-con-muush|work-with-muush`. Unique per locale; validated by a
unit test.

Tracking ids (`FaqTopicId`, from `@/shared/data/trackingEvents`):
`t1 assessment`, `t2 pricing`, `t3 process`, `t4 delivery`,
`t5 work_with_muush`. Question number = 1-based position across the five
topics in page order (t1 1–5, t2 6–10, t3 11–14, t4 15–17, t5 18–20;
question 19 = t5 q2).

`FAQ_CARD`: `{ titleKey, textKey, buttonKey, href: CALL_BOOKING_URL,
email: SUPPORT_EMAIL, track: { name: 'book_call_click', params: {
cta_location: 'faq' } } }`. `SUPPORT_EMAIL` today lives in
`app/features/shell/data/footerColumns.ts` (not in the barrel, CONFIRMED).
With OQ-3 = A it moves to `app/shared/data/supportEmail.ts` and the shell
imports it from there (Article III: shared by two features, lifted, not
reached into). With OQ-3 = B it is imported in place.

## 3 · Resolved view model (`logic/useFaqContent.ts`)

```ts
interface ResolvedFaqQuestion { id: string; number: number /* 1–20 */; question: string; answerKey: string; answerParams: Record<string,string>; answerText: string; links: { placeholder; label; href }[]; email?: { address; href: 'mailto:…' } }
interface ResolvedFaqTopic { id /* locale anchor */; trackingId: FaqTopicId; number; title; questions: ResolvedFaqQuestion[] }
```

`answerText` (plain) feeds the JSON-LD; `answerKey` + slots feed the visible
`<i18n-t>`.

## 4 · State

| State | Owner | Initial | Transitions |
|---|---|---|---|
| `selectedTopic` | `useFaqTopics` | 0, or index of a valid `route.hash` after mount | click, arrows (wrap), Home/End; writes the hash with `replaceState` (OQ-6 = A) |
| `openQuestion` | `useFaqAccordion` | 0 | toggle(i): i if closed (emits `faq_question_open`), `null` if i is open (no event); reset to 0 on topic change (no event) |

No persistence, no network beyond the consented GA4 hit.

## 4b · Tracking event (`app/shared/data/trackingEvents.ts`)

```ts
export const FAQ_TOPIC_IDS = ['assessment', 'pricing', 'process', 'delivery', 'work_with_muush'] as const
export type FaqTopicId = (typeof FAQ_TOPIC_IDS)[number]
// TrackingEvent union gains:
| { name: 'faq_question_open'; params: { faq_topic: FaqTopicId; faq_question: number } }
```

GA4 only (not in `META_EVENT_BY_NAME`), not in `CLICK_EVENT_NAMES`, not a
key event. GA4 custom dimensions (event scope): `faq_topic`, `faq_question`.

## 5 · Structured data

```text
WebPage node (@id = page URL#webpage), @type "FAQPage", inLanguage es-MX|en-US,
  potentialAction [ReadAction], mainEntity → 20 Question nodes
Question: name = question text, acceptedAnswer { @type Answer, text = answerText }
```

## 6 · Background preset `faq`

| | uniforms |
|---|---|
| `uniforms` | `u_flip 1, u_y0 0.2, u_y1 0.5, u_th 0.24, u_right 0.6, u_tx 0.5, u_ty 0.5, u_trx 0.62, u_try 0.42, u_tdark 0, u_fadeT 0.06, u_fadeB 0.3` |
| `compactUniforms` | same + `u_ribs 18`, `u_th 0.26` |
| `poster` | `preguntas-acanalado.webp` = WebP of the `.pen` export `h3JSJ` (1440 × 600), `priority: 'high'`; no mobile poster (one per preset) |
