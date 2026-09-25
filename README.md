# Ayiin — Intelligent Commerce

Ayiin is a multi-vendor marketplace where people shop for themselves and companies buy for their business. It is one marketplace with two modes:

- **Shop personal** (B2C): discovery, verified deals, exact delivery dates, guest checkout.
- **Buy for business** (B2B): volume and contract pricing, quick order, quotes (RFQs), approvals, purchase orders, net terms and repeat purchasing.

Every product page is built to answer the buyer's questions up front: *What should I buy? Why? Is it available? When will it arrive? Can I trust this seller? Is there a better option? Can I compare it, buy it in bulk, reorder it, or get a quote?*

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

---

## Brand identity

The identity system is at **`/brand`**. The source files are in `src/components/brand/logo.tsx` and `public/brand/*.svg`.

| Asset | Where |
|---|---|
| **Symbol: “The Aperture”.** A round-shouldered gateway. Its opening is a negative-space *A*, drawn as a vesica where two arcs (buyer and seller) meet at one apex. A lens bridges the two walls, so it reads as an eye and as the A's crossbar. | `AyiinSymbol` |
| **Wordmark.** Drawn by hand from geometric paths, not typed in a font. The two i's share one lens-shaped tittle, the same lens as in the symbol. | `AyiinWordmark` |
| Horizontal lockup, compact app icon, favicon, monochrome, light and dark versions | `AyiinLockup`, `AyiinAppIcon`, `src/app/icon.svg`, `src/app/apple-icon.tsx`, `src/app/opengraph-image.tsx` |

**Colour** (tokens are in `src/app/globals.css`): Porcelain `#F7F7F2` · White · Deep Ink `#0A0B0D` · Graphite `#202328` · Soft Gray `#E8EAE6` · Signal Lime `#C8FF3D` · Electric Blue `#5967FF`. Surfaces follow a 60/25/10/5 split, and the two accents act only as signals. Every text token passes WCAG AA.

**Type:** Funnel Display for editorial display sizes (weight 400, tight tracking), Geist for the interface, and Geist Mono (tabular figures) for prices, SKUs and data. The fonts are self-hosted from `src/app/fonts/` under the SIL OFL licence.

**Signature elements:** the ringed lime *signal dot* marks anything live or verified; product images sit inside display type as small pills; each section carries a chapter number (`01 — Discover`); a *Clarity* row answers each buyer question; and every product is photographed on the same studio stage, in the same window light.

## What's built

| Route | Purpose |
|---|---|
| `/` | Homepage with a different design per mode. **Personal:** hero with *Ayiin Clarity* (a rotating product card that answers each question), a natural-language “Ask” box, category grid, a tunable For-you feed that says why each item is shown, a *Shop the scene* lookbook of lifestyle shots, verified deals with 12-week price history, bestsellers, compare teaser, seller trust scores, and a bridge to Business mode. **Business:** quick-order box that accepts pasted SKUs or plain text, company credit and approvals card, one-click reorder lists, volume-price explorer with a multi-supplier landed-cost comparison, RFQ flow, and procurement controls. |
| Header | Utility strip (B2B purchasing, Help, Track order, Sell on Ayiin, language and currency). Main row: logo, Categories mega menu, intelligent search (⌘K), mode switch, Account, Saved, Bag. A rail below holds category links and the delivery location. The header is large and spacious at the top of the page and shrinks to a compact, blurred sticky bar on scroll. It is fixed with a spacer underneath, so the page never jumps. |
| `/search?q=` | Intent parsing. For example, “quiet headphones under $300 for flights by friday” becomes these filter chips: *Noise cancelling · Under $300 · Travel-ready · Arrives by date*. Each chip can be removed on its own. A quantity in the query triggers the RFQ flow in business mode. |
| `/c/[slug]` | Category page with a buying guide and filters stored in the URL: subcategory, delivery date, price histogram, rating, verified deals, colour and brand. Business mode adds MOQ, lead time and volume pricing filters. Includes grid and list views (list is the default for B2B) and a mobile filter sheet. |
| `/p/[slug]` | Product page. The gallery has four views per colour, hover-to-zoom that follows the pointer, swipe on touch, and a full-screen viewer with keyboard navigation. Colour swatches switch every view. Shows price history and an honest deal label, the total delivered cost, an exact delivery date with an order-by cutoff, standard vs express delivery, return-by date, the seller's scorecard, an *Ayiin Brief* (pros, cons and best-for, summarised from reviews), “Is there a better option?”, specs, a bought-together bundle, and filterable reviews. **Business mode** adds a tier table, contract price, MOQ and lead time, other sellers stocking the same item, “Add to list” and “Request quote”. Product JSON-LD is included. |
| `/compare` | Up to 4 products side by side, with a “differences only” toggle and the best value highlighted on each row. |
| `/cart`, `/checkout`, `/checkout/confirmation` | Items are grouped into shipments with delivery dates, and the total is shown up front. Checkout is a single page with guest checkout, inline validation and express pay. **Business checkout:** PO number, cost centre, ship-to location, Net 30 / ACH / card, tax exemption, and routing for approval above the buyer's limit. |
| `/business` | Procurement hub: overview (KPIs, spend chart, approvals), quick order with CSV upload, lists and schedules, quotes, approval rules, orders and invoices, team and budgets, locations. |
| `/brand`, `/wishlist`, `/account`, `/track`, `/help`, `/sell`, 404 | Supporting pages. |

## How it addresses the pain points in the brief

- **Discovery and search:** natural-language intent parsing, typo tolerance, a buying guide on each category, and a recommendation feed that explains itself and never repeats a category more than twice.
- **Trust:** a public scorecard for every seller (on-time rate, rating, response time, return rate), reviews only from verified orders, and deal badges that must be backed by 12 weeks of price history.
- **Price and delivery certainty:** exact delivery dates instead of ranges, total delivered cost on the product page, a free-shipping progress bar, and the return-by date shown before purchase.
- **Checkout friction:** guest checkout by default, one page, express pay, and an optional “save details with one tap” step after ordering.
- **Mobile:** a thumb-zone tab bar, a compact header, a full-screen search sheet, a bottom-sheet filter panel, and a sticky add-to-bag bar.
- **B2B:** tier and contract pricing everywhere, quick order from SKUs or plain text, multi-supplier landed-cost comparison, RFQs, approval rules, POs, Net 30/60 terms, tax exemption, reorder schedules, multiple delivery locations, and team spending limits.
- **Quick look:** every product card opens a preview dialog (views, colours, delivery, seller, add to bag) without leaving the grid.
- **Restraint:** no pop-ups, one accent colour used as a signal, and reduced-motion respected everywhere.

## Architecture

- **Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4** (CSS-first `@theme` tokens), **Zustand** for persisted client state.
- **Mode and currency are stored in cookies** (`src/lib/prefs.ts`, `src/lib/server-prefs.ts`). The server renders the right experience on the first paint with no flash. Switching modes writes the cookie, runs a View Transition and refreshes the server components.
- **Catalogue** (`src/lib/catalog/*`): typed products carrying both B2C and B2B fields (SKU, unit, case pack, MOQ, price tiers, lead time, contract price), plus sellers, categories and multi-vendor offers.
- **Commerce logic** (`src/lib/commerce.ts`, `search.ts`, `listing.ts`, `quick-order.ts`): delivery dates in business days computed in UTC so server and client agree, honest price insights, tier pricing, intent parsing and scoring, and filter and sort logic.
- **Product imagery** (`public/products/{slug}/{variant}-{view}.webp`, `src/components/product/product-image.tsx`): photoreal studio renders of every product in every colour. Each has four views: front, angle, detail (shallow depth of field) and an *in context* lifestyle shot on a travertine plinth in window light. `ProductImage` wraps `next/image` with responsive `sizes`, shows a shimmer tinted to the product's studio colour while the image decodes, then fades the image in. The renders come from `tools/studio` (see below).
- **Loading states:** every route has a `loading.tsx` skeleton that matches its layout, persisted-store UI shows shaped skeletons until hydration, and every image shimmers until it loads (`src/components/ui/skeleton.tsx`, `.shimmer` in `globals.css`). Reduced motion is respected.
- **Accessibility:** WCAG 2.2 AA was checked with axe on every route in both modes. Every flow works by keyboard, dialogs have focus handling, search is an ARIA combobox, charts have table fallbacks, and reduced motion is honoured.

### Studio renders (`tools/studio`)

No stock photography is used. Each product is modelled in three.js and lit like a real product shoot: a large jittered softbox key light, a sky-occlusion hemisphere light and a seamless cyclorama sweep. The *in context* view adds a window gobo and a stone plinth. Each image averages 32–40 jittered frames (soft shadows, anti-aliasing, depth of field) in a float buffer, then applies neutral tone mapping.

```bash
cd tools/studio && npm install && npx playwright install chromium
npm run serve &            # static server on :8765
npm run manifest           # jobs.json from src/lib/catalog/products.ts
npm run render             # renders into public/products (skips existing files)
npm run preview -- sheet.png 360 16 "mug|kind=mug&c=a7b39a&t=efe9e0"   # contact sheet while modelling
```

Rendering uses software WebGL by default, so it runs on any machine; set `GPU=1` to use a real GPU. `CHROMIUM_PATH` points at an existing Chromium build. To render in parallel, run `node batch.js 0 2` and `node batch.js 1 2` side by side. Delete an image to have it re-rendered.

All data is demo data. Payments, quotes and approvals are simulated on the client, and orders, lists and carts persist in `localStorage`.
