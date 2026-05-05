# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FarmFresh (Nareshwadi Products) is a dual-portal e-commerce platform connecting farmers directly to customers. Built with React 18, TypeScript, Vite, and Supabase (PostgreSQL, Auth, Storage, Real-time).

## Commands

### Development
```bash
npm run dev              # Start Vite dev server on port 3000
npm run build            # TypeScript compile + production build
npm run build:dev        # Development mode build
npm run build:prod       # Production build
npm run preview          # Preview production build
```

### Testing
```bash
npm test                 # Run all Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Tests with coverage report
npm run test:unit        # Component tests only
npm run test:integration # Integration tests
npm run test:security    # Security-focused tests
npm run test:cart-wishlist  # Cart/wishlist specific tests
```

### Linting
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
```

### Deployment
```bash
npm run deploy           # Build + security tests + deploy
npm run deploy:render    # Production build for Render
```

## Architecture

### Dual-Portal System
- **Customer Portal** (`/customer`): Product browsing, cart, wishlist, order tracking
- **Farmer Portal** (`/farmer`): Product management, order fulfillment, inventory, analytics

### Directory Structure
```
src/
├── pages/              # Route components (Index, Cart, Wishlist, Login, farmer/*)
├── components/         # Reusable UI (Header, NavBar, Hero, ProductsSection, ui/)
├── hooks/              # React hooks (useCart, useWishlist, use-toast)
├── lib/                # Service layer (cartService, orderService, productService, wishlistService)
├── integrations/       # Supabase client and types
├── contexts/           # React contexts (NotificationContext)
└── __tests__/          # Jest tests (components, hooks, integration, security)
```

### Key Patterns
- **Service Layer**: All data operations go through `src/lib/*Service.ts` modules (cartService, orderService, productService, wishlistService)
- **Context Providers**: CartProvider, WishlistProvider, NotificationProvider wrap the app
- **Supabase Integration**: Real-time database with Row Level Security (RLS)
- **Path Aliases**: `@/` resolves to `src/` (configured in tsconfig.json)

### Authentication
- Customer auth: Supabase Auth (email/password)
- Farmer auth: Hardcoded credentials for demo (`test@nareshwadi.in` / `farmer`)

### Database Schema
- `products` - Product catalog with category_id FK to categories table
- `categories` - Product categories (auto-created by productService.getCategoryIdByName)
- `orders` + `order_items` - Order management with JSONB shipping_address
- `cart_items` - User shopping carts
- `wishlist_items` - User wishlists
- `users` - Extended user profiles

### Service Layer Details
- `productService.addProduct()` handles category FK resolution automatically
- `orderService.createOrder()` accepts shipping_address as object (stored as JSONB)
- `cartService` and `wishlistService` sync to Supabase on user login

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
VITE_API_URL=http://localhost:8000/api/v1  # Optional Django backend
```

## Testing Notes

- Jest configured with ts-jest, jsdom environment
- Module mapping: `@/hooks/*` → `src/hooks/*`, `@/lib/*` → `src/lib/*`
- Security tests validate XSS, injection, and input sanitization
- Integration tests cover cart-wishlist flows and user authentication

## Backend

Django 5.2 backend available in `backend/` directory:
```bash
cd backend && python manage.py runserver  # Django backend on port 8000
```
API routes under `/api/v1/` with JWT + Passport.js authentication.
