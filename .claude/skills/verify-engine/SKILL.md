---
name: verify-engine
description: Run the Jest test suite for Deccum's simulation engine (lib/engine/), summarize any failures against expected tax/RMD/IRMAA/withdrawal behavior, and flag whether a failure looks like a real regression or a stale test fixture. Use after changing anything in lib/engine/ or lib/tax-data/, or when the user asks to verify the calculations are correct.
---

Verify Deccum's retirement-calculation engine is behaving correctly.

1. Run `npm test` (all suites) if the change touched shared types or multiple modules; otherwise scope it with `npx jest lib/engine` to save time.
2. For any failure, read the failing test and the module under test together before concluding anything — this engine encodes real tax law (federal brackets, NIIT, RMD divisors, IRMAA tiers, ACA subsidy cliffs, Rule of 55, Roth 5-year/basis rules), so a failing assertion may mean either a genuine logic bug or a test fixture built against outdated tax-year constants.
3. Cross-check suspicious numeric assertions against `lib/tax-data/` for the tax year in question rather than assuming the test is right or the code is right.
4. Report: which suites ran, pass/fail counts, and for each failure — file, what broke, and whether it looks like a code regression vs. a stale fixture vs. an intentional behavior change that needs the test updated.
5. Do not "fix" a failing test by loosening its assertion unless you've confirmed the previous expected value was wrong — these tests are the safety net for tax-code correctness.
