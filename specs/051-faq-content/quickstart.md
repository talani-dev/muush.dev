# Quickstart · verify feature 51

1. `./init.sh` (Biome, typecheck, tests, generate, Storybook build) exits 0.
2. `pnpm generate`, then serve `.output/public` (e.g. `python3 -m http.server`
   from that folder) and open `/es/preguntas` and `/en/faq`.
3. At 1440 × 900 and 390 × 844 (device emulation, not window size):
   - topic 01 selected, question 1 open, the acanalado band at its drawn
     distance from the page top (84 / 68 px); the content follows the
     site-wide centred framing, so the title may sit over the band (FR-019);
     compare the rest with `referencias/preguntas-{es,en}-{escritorio,movil}.png`;
   - click each topic; arrows / Home / End on the tab list; open and close
     questions (one open per topic);
   - `/es/preguntas#precios`, `/en/faq#pricing` and `#nada`; select a topic
     (URL hash changes, no scroll, Back leaves the page); switch language
     from `#precios` (lands on `/en/faq#pricing`);
   - the privacy and about links, both `mailto:` links, the card button
     (new tab, cal.com).
4. At 360, 768, 1024, 1280 and 1920: `document.documentElement.scrollWidth
   === innerWidth`; no clipped or overlapping text; chips scroll inside
   their row below 1024.
5. Reduced motion on: the band is a still frame; no animated transitions.
   WebGL disabled: the poster shows.
6. View source of both documents: 20 answers present; one FAQPage graph
   (paste into the Schema.org validator: 20 questions, no errors).
7. `curl` `/sitemap.xml` (10 URLs) and `/llms.txt` (new FAQ lines).
8. Header on every page: `Inicio · Servicios · Nosotros · Preguntas`
   centred, same four in the mobile menu, "Preguntas" / "FAQ" lit only on
   this page; at 1024 nothing overlaps. Footer unchanged.
9. Tracking (accept Analítica in a private window, GA4 DebugView or the
   `collect` requests): opening a closed question sends one
   `faq_question_open` with `faq_topic` / `faq_question`; closing, the
   automatic first-question open and topic switches send nothing; no
   `fbq('track', …)` call for it.
