# Deccum — Retirement Withdrawal Simulator

Client-side Next.js calculator that maps a year-by-year withdrawal sequence across Traditional 401(k)/IRA, Roth, brokerage, and pension income. Each year is re-optimized as balances, tax brackets, RMDs, ACA subsidy cliffs, and IRMAA tiers shift.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (localStorage persistence)
- react-hook-form + Zod
- Recharts
- Jest + React Testing Library

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test

```bash
npm test
```

## What it models

- Federal ordinary income brackets + standard deduction (Single / MFJ)
- Stacked long-term capital gains brackets (0% / 15% / 20%)
- Flat state tax rate input
- RMD start ages (SECURE 2.0) + Uniform Lifetime Table
- Early-withdrawal penalty with Rule of 55 exception
- Roth contribution vs. earnings basis + 5-year rule toggle
- Simplified ACA MAGI cliff using a user-entered benchmark premium
- IRMAA surcharges with a 2-year MAGI lookback

## Optimization objective

Find the **maximum constant, inflation-adjusted after-tax spending** sustainable to the plan end age. Within each year, a waterfilling allocator picks the lowest marginal-cost withdrawal source (Roth basis, brokerage basis, brokerage gains, Traditional, Roth earnings), respecting forced RMDs.

## Disclaimer

Educational planning tool only — not tax, legal, or investment advice. Tax constants live in `lib/tax-data/` and should be reviewed against IRS / CMS publications each year.

## Future work

- Full ACA subsidy calc with county / plan premium data
- Per-state bracket tables
- SEPP 72(t) exception
- Monte Carlo / variable-return mode
