# Task 1-a: Incoterms Page Component

## Agent: Incoterms Page Agent

## Task
Create `/home/z/my-project/src/components/cargo/incoterms-page.tsx` — a comprehensive Incoterms 2020 reference and decision tool page.

## Work Log
- Read `worklog.md` for project context (FreightFlow Pro, teal/emerald palette, French text, shadcn/ui + framer-motion + recharts)
- Read `customs-page.tsx` to understand design patterns (KPI cards, Card layout, motion animations, Table usage, Dialog patterns)
- Confirmed `incoterms` page type already exists in cargo-store.ts and is imported in page.tsx
- Created `incoterms-page.tsx` with 1,270 lines of rich, functional content

## Sections Implemented

### 1. KPI Cards Row (4 cards)
- Total Incoterms (11), Plus utilisé ce mois (FOB/342), Expéditions actives (156), Impact revenus (2.4M€)
- Gradient icon backgrounds matching project palette

### 2. Interactive Incoterms 2020 Reference Grid
- All 11 rules as interactive cards in a grid
- Tabbed view: All / Maritime / Multimodal
- Maritime (Ship icon, teal): FAS, FOB, CFR, CIF
- Multimodal (Globe icon, amber/orange): EXW, FCA, CPT, CIP, DAP, DPU, DDP
- Each card shows: Code, Full name, French name, Description, Category badge, Risk transfer point, Usage, Cost distribution bar (seller/buyer split with animated progress)

### 3. Cost & Responsibility Matrix
- Full table with all 11 incoterms × 10 cost categories
- Color-coded cells: teal (V=Vendeur), amber (A=Acheteur)
- Animated cell appearance with framer-motion
- V/A summary column
- Sticky first column for horizontal scroll
- Legend at bottom

### 4. Incoterm Recommender Tool
- 4 input selectors: Transport mode (maritime/aérien/terrestre/multimodal), Trade direction (export/import), Control preference (seller/buyer/balanced), Insurance preference (required/optional/not needed)
- Smart recommendation logic covering all combinations
- Animated result panel showing: Recommended Incoterm with gradient badge, Cost summary (seller/buyer progress bars), Risk transfer SVG visualization
- Empty state with placeholder

### 5. Incoterm Comparison
- Two dropdowns to select incoterms
- Side-by-side comparison: Category, Risk transfer, Cost counts, Main carriage, Insurance, Import customs, Unloading
- Full cost matrix comparison table with difference indicators (⚠️ for differences, ✅ for same)
- Side-by-side risk transfer SVG visualizations
- Highlighted rows where values differ

### 6. Usage Statistics
- Recharts BarChart with 11 incoterms usage data
- Color-coded bars: teal for maritime top terms, emerald for top multimodal, amber for others
- Summary stats: Total shipments, #1 Incoterm, Maritime total, Multimodal total

### Additional Features
- Custom SVG Risk Transfer visualization component showing seller→buyer cost transition with risk transfer point
- Detail modal/dialog when clicking any incoterm card (full details, obligations, cost breakdown)
- All text in French
- Dark mode support with `dark:` classes
- Responsive grid layouts
- Framer-motion animations throughout

## Verification
- `bun run lint`: Passed with no errors
- Dev server: HTTP 200 confirmed
- File size: 1,270 lines (exceeds 600 line minimum)
