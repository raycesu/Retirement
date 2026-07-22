# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Self-directed near-retirees and retirees planning their own withdrawal strategy — not financial advisors. Comfortable working with numbers and doing DIY retirement planning, using this to decide how much to withdraw each year and from which accounts.

## Product Purpose

Deccum is a client-side retirement withdrawal simulator. It projects a year-by-year withdrawal sequence across Traditional 401(k)/IRA, Roth, brokerage, and pension/Social Security income, re-optimizing the source mix each year as balances, tax brackets, RMDs, and benefit cliffs shift. Success means the user leaves with a concrete, defensible year-by-year withdrawal plan that maximizes sustainable after-tax spending.

## Positioning

Unlike a generic "4% rule" retirement calculator, Deccum is a full tax- and benefit-aware optimizer: it re-optimizes withdrawal sources every single year against real federal ordinary/capital-gains brackets, standard deduction, RMDs (SECURE 2.0 Uniform Lifetime Table), early-withdrawal penalties (Rule of 55), Roth basis/5-year rules, ACA MAGI subsidy cliffs, and IRMAA 2-year-lookback surcharges — using a waterfilling allocator to maximize constant inflation-adjusted after-tax spending.

## Operating Context

Single-session, client-side use: the user fills in a plan form (account balances, income sources, assumptions), the engine runs (optionally offloaded to a Web Worker), and results render as year-by-year tables and charts (balance projection, withdrawal mix, cliff warnings). State persists to localStorage via Zustand so a user can return to an in-progress plan.

## Capabilities and Constraints

- Pure client-side simulation; no backend, no accounts, no saved user data beyond localStorage.
- Tax-year constants (brackets, IRMAA tiers, RMD divisors, FPL) live in `lib/tax-data/` and must be reviewed against IRS/CMS publications annually — currently only 2026 data is populated.
- Educational planning tool only — outputs are not tax, legal, or investment advice (undecided whether/how prominently this is surfaced in the UI itself).

## Brand Commitments

Product name is **Waterline** (renamed from the earlier placeholder "Deccum"). The name refers to the engine's waterfilling withdrawal allocator and to the positioning of holding one constant, sustainable spending line steady across shifting accounts and tax rules.

## Evidence on Hand

No user testimonials, case studies, or third-party proof exist yet. Do not fabricate any.

## Product Principles

- Optimize for real after-tax, benefit-aware outcomes, not a simplified withdrawal rule.
- Numeric transparency: a numbers-comfortable user should be able to see and trust the year-by-year mechanics, not just a black-box recommendation.
- Correctness over polish where they conflict — tax/benefit logic is safety-critical; the UI should not obscure or oversimplify it.
- Single-session, low-friction: no account creation or backend dependency to get a plan.

## Accessibility & Inclusion

No product-specific accessibility requirement established yet.
