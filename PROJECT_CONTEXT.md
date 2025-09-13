# FarmFresh: Farm-to-Table E-commerce Platform

## Project Overview

FarmFresh is a comprehensive e-commerce platform connecting farmers directly with consumers, enabling the sale of fresh, organic produce and agricultural products. The platform features a dual-portal system - one for farmers to manage their products and orders, and another for customers to browse and purchase items.

## Database Schema

The application uses PostgreSQL with the following core tables:

### Users and Profiles
```sql
-- Core user account information
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  address TEXT,
  phone VARCHAR,
  is_seller BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Extended profile for sellers/farmers
seller_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  farm_name VARCHAR,
  description TEXT,
  region VARCHAR,
  certification VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Product Management
```sql
-- Product categories
categories (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  created_at TIMESTAMPTZ
)

-- Product listings
products (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES seller_profiles(id),
  category_id UUID REFERENCES categories(id),
  name VARCHAR,
  description TEXT,
  price NUMERIC,
  quantity INTEGER,
  image_url VARCHAR,
  certification VARCHAR,
  region VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Orders and Cart Management
```sql
-- Shopping cart items
cart_items (
  id UUID PRIMARY KEY,
  user_id TEXT,
  product_id UUID REFERENCES products(id),
  name TEXT,
  price NUMERIC,
  image TEXT,
  category TEXT,
  description TEXT,
  is_organic BOOLEAN,
  in_stock BOOLEAN,
  quantity INTEGER,
  selectedVariant JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Customer orders
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  shipping_address TEXT,
  status order_status,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Order line items
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name VARCHAR,
  product_price NUMERIC,
  quantity INTEGER
)
```

### Customer Engagement
```sql
-- Product reviews
reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ
)

-- User wishlist
wishlist (
  id UUID PRIMARY KEY,
  user_id TEXT,
  product_id UUID REFERENCES products(id),
  name TEXT,
  price NUMERIC,
  image TEXT,
  category TEXT,
  description TEXT,
  is_organic BOOLEAN,
  in_stock BOOLEAN,
  selectedVariant JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message TEXT,
  type VARCHAR,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
```

## Key Features

### Farmer Portal
1. Product Management
   - Add/edit/remove products
   - Manage inventory
   - Set prices and descriptions
   - Upload product images
   - Track stock levels

2. Order Management
   - View incoming orders
   - Update order status
   - Track deliveries
   - Manage customer communications

3. Analytics Dashboard
   - Sales analytics
   - Inventory tracking
   - Customer insights
   - Revenue reports

### Customer Portal
1. Shopping Experience
   - Browse products by category
   - Search functionality
   - Filter by region/certification
   - Add to cart/wishlist
   - Product reviews and ratings

2. Account Management
   - Order history
   - Saved addresses
   - Wishlist management
   - Notification preferences

3. Checkout Process
   - Shopping cart management
   - Multiple payment methods
   - Address selection
   - Order tracking

## Technical Architecture

1. Frontend
   - React with TypeScript
   - TailwindCSS for styling
   - React Query for data fetching
   - Context API for state management
   - Shadcn UI components

2. Backend
   - Node.js/Express
   - PostgreSQL database
   - Supabase for auth and realtime features
   - RESTful API architecture

3. Authentication & Security
   - JWT based authentication
   - Role-based access control
   - Secure password hashing
   - Input validation

4. Performance Optimizations
   - Query caching
   - Lazy loading
   - Image optimization
   - Code splitting

## Development Guidelines

1. Code Organization
   - Feature-based folder structure
   - Reusable components in shared directory
   - Custom hooks for logic reuse
   - TypeScript interfaces in types folder

2. State Management
   - React Query for server state
   - Context API for UI state
   - Local storage for persistence
   - Form state with React Hook Form

3. Testing Strategy
   - Unit tests for utilities and hooks
   - Integration tests for components
   - E2E tests for critical flows
   - API endpoint testing

4. API Patterns
   - RESTful endpoints
   - Consistent error handling
   - Request validation
   - Rate limiting

## Production Readiness Goals

### 1. Performance Optimization
- Lighthouse scores: 90+ for Performance, Accessibility, Best Practices, and SEO
- Code splitting and lazy loading for all routes and heavy components
- WebP image format with responsive sizing
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3.5s
- Service workers for offline functionality and PWA support
- Response time < 200ms for API endpoints
- Optimized bundle size with tree shaking

### 2. Security Requirements
- Content Security Policy (CSP) headers
- HTTP Strict Transport Security (HSTS)
- Input sanitization and XSS protection
- Rate limiting and DDoS protection
- Regular security audits
- Automated dependency updates
- SQL injection prevention
- CORS policy implementation
- Security headers (X-Frame-Options, X-Content-Type-Options)

### 3. Scalability Architecture
- Horizontally scalable backend services
- Database read replicas for high traffic
- CDN integration for static assets
- Multi-level caching strategy:
  - Browser caching
  - CDN caching
  - API response caching
  - Database query caching
- Load balancing configuration
- Auto-scaling policies

### 4. Reliability & Monitoring
- 99.9% uptime SLA target
- Error tracking with Sentry
- Performance monitoring with NewRelic
- Real-time alerting system
- Backup strategy:
  - Hourly incremental backups
  - Daily full backups
  - 30-day retention
  - Point-in-time recovery
- Health check endpoints
- Circuit breakers for external services

### 5. User Experience Standards
- WCAG 2.1 AA compliance
- Mobile-first responsive design
- Dark/light mode support
- Form validation:
  - Client-side validation
  - Server-side validation
  - Clear error messages
  - Inline validation
- Animation performance:
  - Max 100ms response time
  - 60fps animations
  - No layout shifts
- Offline support
- Progressive enhancement

### 6. SEO Implementation
- Server-side rendering for critical pages
- Dynamic sitemap generation
- Structured data for:
  - Products
  - Reviews
  - FAQs
  - Organization
- Meta tags optimization
- OpenGraph integration
- Canonical URLs
- SEO-friendly URLs
- XML sitemap
- Robots.txt configuration

### 7. Development & Deployment
- CI/CD pipeline:
  - Automated testing
  - Code quality checks
  - Security scanning
  - Performance testing
  - Accessibility testing
- Feature flags system
- Testing coverage:
  - Unit tests: 80%+
  - Integration tests: 70%+
  - E2E tests: Critical paths
- Performance budgets:
  - Max bundle size: 250KB (initial)
  - Max image size: 200KB
  - Max API response time: 200ms
- Automated deployment rollbacks
- Blue-green deployment

### 8. Analytics & Metrics
- Google Analytics 4 integration
- Custom event tracking
- Conversion funnel analysis
- User journey mapping
- A/B testing framework
- Real-time dashboards:
  - Sales metrics
  - User engagement
  - Performance metrics
  - Error rates
- Customer feedback system
- Heat maps and session recording

### 9. Compliance Requirements
- GDPR compliance:
  - Data privacy controls
  - User consent management
  - Data export functionality
  - Right to be forgotten
- CCPA compliance
- PCI DSS compliance for payments
- Accessibility compliance (WCAG 2.1)
- Cookie consent management
- Terms of Service
- Privacy Policy
- Data retention policies

### 10. Documentation Standards
- API documentation:
  - OpenAPI/Swagger specs
  - Authentication details
  - Rate limits
  - Example requests/responses
- Developer documentation:
  - Setup guide
  - Architecture overview
  - Code style guide
  - Contributing guidelines
- System runbooks:
  - Deployment procedures
  - Monitoring setup
  - Common issues
  - Troubleshooting guides
- Disaster recovery plan
- Security incident response plan

### Success Metrics
- Test Coverage: 95%+
- Page Load Time: < 2s
- Time to Interactive: < 3.5s
- Error Rate: < 1%
- User Satisfaction: > 4.5/5
- System Uptime: 98%+
- Security: Zero critical vulnerabilities
- API Response Time: 95th percentile < 200ms
- Mobile Performance: Same targets as desktop
- Accessibility: 100% WCAG 2.1 AA compliance

This context file serves as a reference for AI coding agents to understand the project structure, requirements, and best practices while implementing features or fixing issues. All development work should align with these production readiness goals to ensure a high-quality, scalable, and maintainable application.
