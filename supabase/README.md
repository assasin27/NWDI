# Supabase Database Setup

This directory contains SQL migrations for setting up and managing the Nareshwadi Products e-commerce platform database in Supabase.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20250811183600_initial_schema.sql  # Initial database schema
│   └── 20250811183601_rls_policies.sql    # Row Level Security policies
└── README.md                              # This file
```

## Setup Instructions

### Prerequisites

1. A Supabase project created at [https://app.supabase.com/](https://app.supabase.com/)
2. Supabase CLI installed (optional but recommended)

### Applying Migrations

#### Option 1: Using Supabase Dashboard (Recommended for most users)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open a new query
4. Copy the contents of `20250811183600_initial_schema.sql` and run it
5. Copy the contents of `20250811183601_rls_policies.sql` and run it

#### Option 2: Using Supabase CLI (For advanced users)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your local project to your Supabase project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. Apply the migrations:
   ```bash
   supabase db push
   ```

## Database Schema

The database includes the following tables:

- `users`: User accounts and authentication
- `seller_profiles`: Extended information for sellers
- `categories`: Product categories
- `products`: Product listings
- `orders`: Customer orders
- `order_items`: Individual items within orders
- `reviews`: Product reviews and ratings
- `notifications`: System notifications for users

## Security

Row Level Security (RLS) is enabled on all tables with the following policies:

- Users can only view and edit their own data
- Sellers can manage their own products and view related orders
- Anyone can view products, categories, and reviews
- Only admins can modify categories

## Next Steps

1. Set up authentication providers in Supabase
2. Configure storage for product images
3. Set up real-time subscriptions for order updates
4. Create database triggers for business logic

## Troubleshooting

- If you encounter permission errors, ensure you're logged in as an admin
- Check the Supabase logs for detailed error messages
- Verify that all foreign key relationships are correctly set up
