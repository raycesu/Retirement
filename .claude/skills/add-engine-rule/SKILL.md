---
name: add-engine-rule
description: Scaffold a new pure-function module in lib/engine/ (e.g. a new tax rule, penalty, or optimization step) plus a matching Jest test in lib/engine/__tests__/, following this project's existing engine patterns. Use when the user wants to add a new calculation rule or simulation behavior to the retirement engine.
---

Add a new module to Deccum's simulation engine (`lib/engine/`).

1. Read `lib/engine/types.ts` for the shared types (`PlanInputs`, `YearResult`, `TaxYearData`, etc.) the new module should consume/produce.
2. Read 1-2 existing modules most similar to the new rule (e.g. `rmd.ts` for a required-distribution-style rule, `taxes.ts` for a tax-calculation rule, `withdrawal-optimizer.ts` for an allocation rule) to match style: plain exported functions, no classes, inputs/outputs typed against `types.ts`.
3. Create the new file in `lib/engine/` as a pure function (no side effects, no I/O) — the engine is deterministic and testable by design; keep it that way.
4. Wire it into `lib/engine/simulate.ts` or `lib/engine/index.ts` if the new rule needs to run as part of the year-by-year simulation loop.
5. Create a matching test file at `lib/engine/__tests__/<name>.test.ts`. Match the existing test style (see `taxes.test.ts` or `rmd.test.ts`) — table-driven cases against known/published figures where the rule is tax-code-derived.
6. Run `npm test` (or `npx jest lib/engine/__tests__/<name>.test.ts`) and fix failures before considering the task done.
