# CJ BrewKin Coffee - Developer Guide

A full-stack online coffee shop built with Next.js 16, Supabase, and TanStack Query.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **State Management:** TanStack Query, React Context (Cart)
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Project Structure

```
app/
├── page.tsx                 # Homepage with hero & featured products
├── menu/
│   ├── page.tsx            # Product catalog with filtering
│   └── [id]/page.tsx       # Product detail with add-ons
├── cart/page.tsx           # Shopping cart
├── checkout/page.tsx       # Checkout form
├── orders/
│   ├── page.tsx            # Order history
│   └── [id]/page.tsx       # Order detail/tracking
├── account/page.tsx        # User profile
├── auth/
│   ├── login/page.tsx      # Sign in
│   ├── sign-up/page.tsx    # Registration
│   ├── sign-up-success/    # Email confirmation notice
│   └── error/page.tsx      # Auth error handling
└── admin/
    ├── layout.tsx          # Admin sidebar layout
    ├── page.tsx            # Dashboard overview
    ├── products/page.tsx   # Product management
    ├── orders/page.tsx     # Order management
    ├── supplies/page.tsx   # Inventory tracking
    └── suppliers/page.tsx  # Supplier directory

components/
├── providers.tsx           # QueryClient, Cart, Toaster
├── store-header.tsx        # Customer navigation
├── store-footer.tsx        # Footer
├── product-card.tsx        # Product display card
└── ui/                     # shadcn/ui components

lib/
├── supabase/
│   ├── client.ts           # Browser Supabase client
│   └── server.ts           # Server Supabase client
├── cart-context.tsx        # Shopping cart state
├── queries.ts              # TanStack Query hooks
├── types.ts                # TypeScript interfaces
└── utils.ts                # Utility functions

scripts/
├── 001_create_tables.sql   # Database schema
└── 002_seed_data.sql       # Sample data
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to auth.users |
| `categories` | Product categories |
| `products` | Coffee products |
| `addons` | Product add-ons (extra shot, milk, etc.) |
| `orders` | Customer orders |
| `order_items` | Individual items in orders |
| `order_item_addons` | Add-ons per order item |
| `suppliers` | Supplier directory |
| `supplies` | Inventory items |

### Order Status Flow

```
pending → confirmed → preparing → out_for_delivery → delivered
                                                   ↘ cancelled
```

## Environment Variables

Required environment variables (auto-configured via Supabase integration):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Key Features

### Customer Features
- Browse products by category
- Product details with size selection and add-ons
- Shopping cart with quantity management
- Checkout with delivery information
- Order tracking and history

### Admin Features (at `/admin`)
- Dashboard with stats and alerts
- Product management (add, edit, toggle availability)
- Order management with status updates
- Inventory/supplies tracking with restock alerts
- Supplier contact directory

## Making a User Admin

After signing up, update the user's profile in Supabase:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

## Row Level Security (RLS)

The database uses RLS policies:

- **Public:** Categories, products, add-ons are readable by anyone
- **Users:** Can view/create their own orders and profiles
- **Admins:** Full access to all tables

## TanStack Query Usage

Queries are defined in `lib/queries.ts`:

```tsx
// Fetch products
const { data, isLoading } = useProducts(categoryId)

// Mutations with optimistic updates
const { mutate } = useUpdateProduct()
```

## Cart Management

Cart uses React Context with localStorage persistence:

```tsx
const { items, addItem, removeItem, clearCart } = useCart()
```

## Adding New Features

1. **New table:** Add SQL in `scripts/`, run migration
2. **New page:** Create in `app/` directory
3. **New query:** Add hook in `lib/queries.ts`
4. **New type:** Define interface in `lib/types.ts`

## Deployment

Deploy to Vercel with the Supabase integration connected. The database migrations should be run before first deployment.
