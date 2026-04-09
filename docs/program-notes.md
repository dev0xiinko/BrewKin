# Program Notes

Last scanned: 2026-04-10

## 1. Project Summary

`coffee-project` is a Next.js 16 App Router application for **CJ BrewKin Coffee**, combining:

- a customer-facing coffee ordering experience
- Supabase-backed authentication and data storage
- an admin area for products, orders, supplies, and suppliers
- offline-first behavior using IndexedDB, a sync queue, and a service worker

The app is structured as a mostly client-rendered storefront with selective server rendering on landing content and Supabase-backed data reads/writes.

## 2. Primary Stack

- Framework: Next.js 16 with App Router
- Language: TypeScript
- UI: React 19, Tailwind CSS v4, shadcn/ui, Radix UI
- Data layer: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Client data fetching: TanStack Query
- Offline storage: Dexie / IndexedDB
- Notifications: Sonner
- Analytics: Vercel Analytics

## 3. High-Level Architecture

### Frontend layers

The main runtime is assembled in `app/layout.tsx` and `components/providers.tsx`.

- `app/layout.tsx` sets global fonts, metadata, manifest, and wraps the app in shared providers.
- `components/providers.tsx` wires together:
  - `QueryClientProvider`
  - `OfflineProvider`
  - `CartProvider`
  - global offline and install UI
  - Sonner toasts

### Data flow

There are two overlapping data access patterns:

1. **Direct Supabase access**
   - Used in several pages for inserts, updates, auth checks, and some SSR fetches.
   - Example areas: homepage featured products, checkout writes, admin mutations.

2. **Offline-first query helpers**
   - `lib/queries.ts` re-exports functions from `lib/offline-queries.ts`.
   - These read from IndexedDB first, refresh in the background when online, and fall back to network when cache is empty.

This means the project is not purely server-driven or purely offline-driven; it mixes both depending on the route and feature.

### Supabase integration

- `lib/supabase/client.ts` creates the browser client.
- `lib/supabase/server.ts` creates the server client for SSR/server components.
- `proxy.ts` and `lib/supabase/proxy.ts` refresh sessions on requests.

Note: the proxy currently only redirects for `/protected` routes, while the actual admin and account gating is mostly handled in client components.

## 4. Major User Flows

### Customer storefront

- `/`
  - Marketing homepage
  - Loads featured available products server-side
  - Shows aggregate review rating from `reviews`

- `/menu`
  - Product catalog
  - Uses offline-first product/category queries
  - Supports category filtering and text search

- `/menu/[id]`
  - Product detail page
  - Supports size selection, add-ons, notes, quantity, and add-to-cart
  - Displays product feedback

- `/cart`
  - Reads from `CartProvider`
  - Calculates subtotal, delivery fee, and total

- `/checkout`
  - Requires authenticated user
  - Inserts into `orders`, `order_items`, and `order_item_addons`
  - Clears local cart after successful order placement

- `/orders`
  - Authenticated order history
  - Uses offline-first user order query

- `/orders/[id]`
  - Detailed order view
  - Loads joined order data with items and add-ons
  - For delivered orders, exposes per-product review submission

- `/account`
  - Shows user/profile details
  - Links to orders and admin dashboard when applicable

### Authentication

- `/auth/login`
- `/auth/sign-up`
- `/auth/sign-up-success`
- `/auth/error`

Auth appears to be fully Supabase-based, with profile records created through a database trigger.

### Admin

`/admin/*` is protected in `app/admin/layout.tsx` by checking:

- signed-in user exists
- `profiles.is_admin` is `true`

Admin sections:

- `/admin`
  - Dashboard KPIs for products, orders, supplies, and revenue
- `/admin/products`
  - Create/update products
  - Toggle product availability
- `/admin/orders`
  - Review all orders
  - Update order status
- `/admin/supplies`
  - Create/update supplies
  - Restock supply quantities
- `/admin/suppliers`
  - Create/update supplier records

## 5. Shared Runtime Systems

### Cart state

`lib/cart-context.tsx`

- Stores cart items in React state
- Persists to `localStorage` under `cj-brewkin-cart`
- Computes:
  - total item count
  - total price

### Offline state

`lib/offline-context.tsx`

- Tracks online/offline status
- Initializes local cache
- Runs background sync every 60 seconds when online
- Exposes pending queue count and manual sync trigger

### Local database

`lib/db.ts`

Dexie tables:

- `products`
- `categories`
- `addons`
- `orders`
- `suppliers`
- `supplies`
- `profiles`
- `syncQueue`
- `metadata`

The `syncQueue` is used for deferred create/update/delete operations when the app is offline or when local-first writes are preferred.

### Sync service

`lib/sync-service.ts`

Responsibilities:

- fetch and cache Supabase data into IndexedDB
- process queued mutations
- track sync status
- refresh cached datasets after sync

### Service worker / PWA

`public/sw.js`

- pre-caches a small set of routes
- uses network-first for navigation
- uses cache-first for static assets
- broadcasts background sync requests to clients
- handles push notifications and notification click routing

Manifest is defined in `public/manifest.json`, and app metadata also references the manifest in `app/layout.tsx`.

## 6. Data Model Overview

The initial schema is created in `scripts/001_create_tables.sql`.

Core business tables:

- `profiles`
- `categories`
- `products`
- `addons`
- `orders`
- `order_items`
- `order_item_addons`
- `suppliers`
- `supplies`

Later additions:

- `reviews`
- `product_feedbacks`

### Intended order structure

From the base schema, the canonical order storage looks like:

- `orders`
  - customer and delivery fields
  - status
  - total amount
- `order_items`
  - product snapshot data
  - quantity
  - unit price
  - subtotal
- `order_item_addons`
  - addon snapshot data and price

### Review and feedback structure

The repository contains two stages of review support:

- `scripts/008_add_reviews_and_feedbacks.sql`
  - introduces `reviews` and an earlier `product_feedbacks`
- `scripts/009_overhaul_product_feedbacks.sql`
  - replaces `product_feedbacks`
  - adds required `order_id`
  - enforces unique `(user_id, product_id, order_id)`

## 7. SQL Script Notes

The `scripts/` folder behaves more like a hand-managed migration history than a formal migration system.

Observed progression:

- `001_create_tables.sql`
  - initial schema + RLS + profile trigger
- `002_seed_data.sql`
  - initial sample data
- `003_grant_admin.sql`, `007_grant_admin_alquizarkun.sql`
  - admin assignment helpers
- `004_fix_profiles_rls.sql`, `004_fix_rls_policies.sql`
  - RLS adjustments
- `005_update_prices_php.sql`, `006_fix_php_prices.sql`
  - pricing/currency adjustments
- `008_add_reviews_and_feedbacks.sql`
  - review support
- `009_overhaul_product_feedbacks.sql`
  - feedback redesign
- `999_wipe_orders_and_feedbacks.sql`
  - reset utility

Recommendation for maintainers: treat script order carefully and verify the live Supabase schema before assuming TypeScript types match current tables.

## 8. Known Schema / Code Drift

This repo has a few places where the codebase does not perfectly agree with the original schema/types.

### A. Checkout fields vs. shared TypeScript order model

`app/checkout/page.tsx` writes:

- `customer_phone`
- `customer_email`
- `customer_name`
- `notes`

But `lib/types.ts` models orders using:

- `delivery_phone`
- `delivery_notes`

This suggests one of two things:

1. the database evolved and `lib/types.ts` is stale, or
2. the page code was updated to a newer schema while some reads still expect older names

### B. Order item field naming differs across code paths

Base schema and checkout writes use:

- `unit_price`
- `subtotal`

But `fetchOrderWithItems()` and order detail rendering assume nested order items with:

- `price`
- `size`
- `notes`

Those fields do not appear in the original `001_create_tables.sql` definition. This is a strong sign that the running database likely differs from the original bootstrap script.

### C. Cart size pricing mismatch

`lib/cart-context.tsx` uses size adders of:

- `small: 0`
- `medium: 0.5`
- `large: 1`

But the menu/cart/checkout pages use:

- `small: 0`
- `medium: 15`
- `large: 30`

This means cart totals computed in context can diverge from totals shown in page-level UI.

### D. Product page feedback submission path is incomplete

`app/menu/[id]/page.tsx` submits to `/api/feedback`, but its request body omits `order_id`.

`pages/api/feedback.ts` requires:

- `product_id`
- `order_id`
- `rating`
- authenticated user derived from bearer token

Also, the product page request does not attach an Authorization header. As written, that route-level feedback submission is unlikely to succeed against the current API contract.

### E. Mixed App Router and Pages Router usage

The main app uses the App Router, but feedback submission is implemented via `pages/api/feedback.ts`.

This is valid, but worth noting because the project is split across both routing systems.

### F. Type checking is disabled at build time

`next.config.mjs` sets:

- `typescript.ignoreBuildErrors = true`

This lowers build friction, but it also makes schema drift and typing regressions easier to miss.

## 9. Security and Access Notes

### Row Level Security

The initial SQL enables RLS across the main tables.

Intent appears to be:

- public read on catalog data
- self-service access on user-owned records
- admin-wide access for operational tables

Because later fix scripts exist for RLS, maintainers should review live policies in Supabase before relying on the originals.

### Auth guarding style

Most route protection is currently client-side:

- account routes redirect after client auth check
- admin layout redirects after client auth + admin check

This is workable, but it means the user may briefly load shell UI before redirecting.

## 10. Folder Notes

### `app/`

Primary route tree for customer and admin pages.

### `components/`

Reusable layout and UI components.

Notable files:

- `store-header.tsx`
- `store-footer.tsx`
- `product-card.tsx`
- `offline-indicator.tsx`
- `pwa-install-prompt.tsx`

### `lib/`

Core application logic:

- Supabase clients
- offline database
- sync logic
- shared types
- cart context
- utility helpers

### `pages/api/`

Legacy API route area, currently used for feedback submission.

### `public/`

Static assets, icons, images, manifest, and service worker.

### `scripts/`

Database bootstrap, seed, policy fixes, admin grants, and review/feedback adjustments.

## 11. Operational Notes for New Maintainers

If you pick this project up again, check these first:

1. Confirm the live Supabase schema for `orders`, `order_items`, and `product_feedbacks`.
2. Compare live columns against `lib/types.ts`.
3. Reconcile size pricing constants across cart, menu, and checkout logic.
4. Verify that feedback submission is only exposed where `order_id` and auth token are available.
5. Decide whether to keep the hybrid App Router + Pages API setup or consolidate it.
6. Consider re-enabling strict type checking once schema/types are aligned.

## 12. Short Takeaway

This is a solid coffee ordering app with a meaningful offline-first layer and a practical admin console. The main maintenance risk is not feature sprawl, but **model drift** between SQL scripts, shared TypeScript types, and page-level assumptions. Any future work on orders, reviews, or checkout should start with a schema verification pass before adding features.
