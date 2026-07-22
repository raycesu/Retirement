# Design

<!-- impeccable:design-schema 1 -->

## Scope

Applies app-wide: the landing page (`app/page.tsx`), the planner (`app/plan/page.tsx`, `components/plan-form/`), and the results view (`app/results/page.tsx`, `components/results/`). All three extend the same chrome — page background, wordmark, headings, body copy, and figure typography — layered on top of the existing shadcn/ui component library (`components/ui/`), which keeps its own internal styling (buttons, inputs, selects, checkboxes) untouched everywhere. Brass is reserved for genuine regulatory-threshold meaning: the ACA/Medicare cliffs section heading on `/plan`, and stays out of `/results`' cliff warnings, which already use Tailwind's amber scale for the same warning semantics and were left alone.

## Direction

**THESIS:** Waterline is a level gauge, not a dashboard — it visualizes one constant spending line held steady across uneven, shifting account terrain, refusing the soft-gradient hero-card look this category defaults to.

**OWN-WORLD:** Deep ink-navy linework (`#132A40`) on a pale blueprint-grid ground (`#EEF2F5`, 32px grid at low opacity), one brass accent (`#B3813C`) reserved for regulatory threshold markers (RMD/IRMAA/ACA cliffs) and the eyebrow label. Space Grotesk for display type, Figtree for body, IBM Plex Mono for every dollar figure, threshold label, and account name — figures always read as measured, not decorative.

**STORY:** A visitor sees a level line staying flat across an uneven skyline of account "chambers" (401(k), Roth, brokerage, pension), understands the tool keeps spending level no matter the underlying mess, and clicks through to the planner.

**FIRST VIEWPORT:** Headline stating the mechanism (not just the name) on the left, CTA directly below; a custom SVG gauge diagram on the right — four chambers filled to different levels, one dashed waterline drawn level across all of them, two brass dashed threshold lines (IRMAA, RMD) annotated in mono type.

## Palette

| Role | Value | Use |
|---|---|---|
| Ink (primary text, linework) | `#132A40` | headings, chamber walls, CTA background |
| Ink soft (secondary text) | `#3C5A72` | body copy, chamber labels |
| Brass (accent) | `#B3813C` | threshold markers, eyebrow label, gauge tick dots |
| Paper (background) | `#EEF2F5` | page background |

Color strategy: **Restrained** — one accent (brass) used only for regulatory/threshold meaning, never decoratively.

## Type

- Display / headings: Space Grotesk (`--font-space-grotesk`)
- Body: Figtree (`--font-figtree`, existing app default)
- Figures, labels, threshold callouts: IBM Plex Mono (`--font-plex-mono`)

These are applied as arbitrary-value classes (`font-[family-name:var(--font-space-grotesk)]`, etc.) directly on headings and figures across all three pages, layered on top of the app's existing `--font-sans` (Figtree) / `--font-heading` (Syne) / `--font-mono` tokens in `globals.css`. The shared tokens themselves were left unchanged — shadcn component internals (buttons, inputs) still resolve through them, so this identity never touches component-level styling, only page chrome and headings.

## Motion

Entrance fade-ups only (`animate-fade-up*` utilities in `globals.css`), always gated behind `motion-safe:`, used on each page's header. No ambient/looping motion anywhere (the previous decorative drifting blob on the landing page was removed along with its now-unused `drift` keyframe).

## What not to do here

- No gradient hero background, no soft blurred color blobs — those belong to the previous "Deccum" pastel-SaaS direction this redesign replaces.
- No decorative icon tiles or stat cards standing in for content.
- Brass is a signal color for thresholds/regulation, not a general accent — don't spend it on hover states or arbitrary emphasis.
