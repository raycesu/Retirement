---
name: add-tax-year
description: Scaffold a new lib/tax-data/YYYY-federal.ts tax year file (brackets, standard deduction, IRMAA tiers, RMD divisors, NIIT/ACA thresholds) from published IRS/CMS figures, and wire it into the tax-data registry. Use when the user asks to add a new tax year, update projections for a future year, or refresh tax constants.
---

Add a new federal tax year to Deccum's tax-data layer.

1. Read the existing `lib/tax-data/2026-federal.ts` (or the latest year present) as the template — it implements the `TaxYearData` type from `lib/engine/types.ts` and includes: `earlyWithdrawalPenaltyRate`, `niitRate`/`niitThreshold`, `standardDeduction`, `ordinaryBrackets`, `capitalGainsBrackets`, `irmaaTiers`, FPL data, and RMD divisors (SECURE 2.0 Uniform Lifetime Table).
2. Ask the user for the target year and the source figures if not provided (IRS Rev. Proc. for brackets/deduction, CMS release for IRMAA/Part B & D premiums, HHS poverty guidelines for FPL). Do not invent numbers — if a figure isn't supplied and can't be found in a trustworthy local source, ask rather than guess.
3. Create `lib/tax-data/YYYY-federal.ts` following the exact shape of the template, named `taxDataYYYY`.
4. Update `lib/tax-data/index.ts`: import the new constant, add it to `taxYearRegistry`, and add it to the file's final `export { ... }` list.
5. Remind the user that the README flags these constants as needing manual review against IRS/CMS publications annually — this skill scaffolds the shape but the values must be verified against real published figures before trusting simulation output.
6. Suggest running the relevant engine tests (`lib/engine/__tests__/taxes.test.ts`, `rmd.test.ts`) to confirm nothing assumes a hardcoded single year.
