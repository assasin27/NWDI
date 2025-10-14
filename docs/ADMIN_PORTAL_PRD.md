# Admin Portal Product Requirements Document (PRD)
> Last Updated: October 13, 2025

## Table of Contents
- [Purpose and Scope](#purpose-and-scope)
- [Success Metrics](#success-metrics)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Core Modules and Requirements](#core-modules-and-requirements)
- [UX Requirements](#ux-requirements)
- [Data Model](#data-model)
- [APIs and Integrations](#apis-and-integrations)
- [Security and Non-Functional Requirements](#security-and-non-functional-requirements)
- [Workflows](#workflows)
- [Release Plan](#release-plan)
- [Risks and Mitigations](#risks-and-mitigations)
- [Acceptance Criteria](#acceptance-criteria)

## Purpose and Scope

### Objective
Build a secure, performant admin portal for Nareshwadi products to manage orders, inventory, and business analytics across web and mobile (responsive) form factors.

### Primary Users
- Super Admin
- Operations Manager
- Inventory Manager
- Customer Support
- Finance Analyst
- Data Analyst

### Scope Definition

**In Scope:**
- Authentication & Authorization (RBAC)
- Orders Management
- Inventory Management
- Analytics & Reporting
- Customer Lookup
- Refunds Processing
- Basic Promotions
- Audit Logging
- Notifications
- Data Export

**Out of Scope (Phase 1):**
- CMS for storefront content
- Advanced marketing automation
- Supplier onboarding
- Warehouse routing optimizers
- Returns logistics automation
- ML-based forecasting

## Success Metrics

| Metric | Target | Timeline |
|--------|---------|----------|
| Operational Efficiency | 30% reduction in order handling time | 60 days |
| Data Reliability | <1% inventory reconciliation variance | Weekly |
| Portal Performance | Median page load <1.5s | Continuous |
| API Performance | P95 latency <400ms | Continuous |
| User Adoption | 90% daily ops via portal | 30 days post-rollout |
| Data Accuracy | 100% audit log coverage | Continuous |

## User Roles and Permissions

### Role-Based Access Control (RBAC)

#### Super Admin
- Full access to all modules
- User management
- System settings
- Audit logs
- Data exports

#### Operations Manager
- Orders management
- Fulfillment workflows
- Refunds processing
- Delivery exception handling
- Bulk operations
- Operational exports

#### Inventory Manager
- SKU management
- Stock adjustments
- Purchase orders (POs)
- Supplier mapping
- Inbound/outbound stock
- Batch/lot tracking

#### Customer Support
- Order lookups
- Status updates (with guardrails)
- Limited refund processing
- Customer notes
- Reshipment requests

#### Finance Analyst
- Payout tracking
- COD reconciliation
- Invoice exports
- Tax reporting
- Refund review

#### Data Analyst
- Read-only analytics access
- Dashboard access
- Data export capabilities

## Core Modules and Requirements

### Orders Management

#### Order List View
- Status filters:
  - Placed
  - Confirmed
  - Packed
  - Shipped
  - Delivered
  - Cancelled
  - Returned
- Additional filters:
  - Payment method
  - Date range
  - Channel
  - Courier
  - Risk flags

#### Order Detail View
- Customer information
- Item details
- Pricing breakdown
- Tax calculations
- Discount application
- Payment status
- Delivery information
- Timeline view
- Internal notes
- Fulfillment steps
- SLA tracking

#### Order Actions
- Order confirmation
- Warehouse assignment
- Pick/pack slip generation
- Invoice generation
- Shipment tracking
- Partial fulfillment
- Cancellation workflow
- Refund processing
- Reshipment handling

### Inventory Management

#### SKU Management
- Create/edit SKUs
- Variant handling
- Attribute management
- Pricing controls
- Tax categorization
- Barcode generation
- Image management
- Shelf-life tracking
- Batch/lot management

#### Stock Controls
- Real-time inventory tracking
- Location-based stock levels
- Safety stock management
- Stock reservation system
- Backorder handling
- Cycle count tools
- Adjustment workflows

#### Supply Chain
- GRN processing
- Purchase order management
- Inter-location transfers
- Dispatch logging
- Wastage tracking
- Supplier management

### Analytics and Reporting

#### Sales Analytics
- Revenue tracking
- Average order value (AOV)
- Units sold
- Conversion metrics
- Payment method mix
- Channel performance

#### Operational Metrics
- Fulfillment SLA compliance
- Pick/pack efficiency
- Courier performance
- NDR/RTO rates
- Cancellation tracking
- Refund analysis

#### Inventory Analytics
- Sell-through rates
- Stock coverage
- Stockout tracking
- Overstock identification
- Inventory aging
- Expiry risk assessment

## UX Requirements

### Layout
- Left navigation menu
- Top bar with global functions
- Content area with list/detail views
- Responsive design (desktop-first)

### Key Features
- Global search functionality
- Notification system
- User preference settings
- Customizable dashboards
- Saved filters
- Bulk action tools

### Accessibility
- WCAG AA compliance
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast requirements

## Data Model

### Core Entities

#### Order
```typescript
interface Order {
  id: string;
  status: OrderStatus;
  channel: string;
  customerId: string;
  items: OrderItem[];
  pricing: PricingDetails;
  taxes: TaxDetails;
  discounts: DiscountDetails[];
  paymentStatus: PaymentStatus;
  courierId?: string;
  awb?: string;
  timeline: TimelineEvent[];
  notes: Note[];
  auditId: string;
}
```

#### Product/SKU
```typescript
interface Product {
  id: string;
  name: string;
  variants: Variant[];
  attributes: Attribute[];
  barcode: string;
  taxCategory: string;
  price: PriceDetails;
  images: string[];
  shelfLifeDays?: number;
  isBatchTracked: boolean;
}
```

#### Inventory
```typescript
interface Inventory {
  skuId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number;
  safetyStock: number;
  batches: Batch[];
}
```

## APIs and Integrations

### Authentication
- JWT-based sessions
- Refresh token rotation
- MFA support
- OAuth2 readiness

### Core APIs
- Orders CRUD
- Inventory management
- Analytics endpoints
- Customer service tools
- Report generation
- Bulk operations

### External Integrations
- Payment gateways
- Courier services
- SMS/Email providers
- Tax calculation services
- Analytics platforms

## Security and Non-Functional Requirements

### Security Measures
- MFA enforcement
- Password policies
- HTTPS-only
- Rate limiting
- CSRF protection
- Input validation
- PII protection

### Performance Targets
- Page load: <1.5s median
- API latency: <400ms P95
- Background job handling
- Caching strategy

### Reliability Goals
- 99.9% uptime
- Graceful degradation
- Circuit breaker patterns
- Retry mechanisms

## Workflows

### Order Processing
1. Order received
2. Payment verification
3. Inventory reservation
4. Warehouse assignment
5. Picking process
6. Packing verification
7. Shipping handoff
8. Delivery tracking
9. Completion/Exception handling

### Inventory Management
1. Stock level monitoring
2. Reorder triggers
3. PO generation
4. Receipt processing
5. Stock adjustment
6. Cycle count
7. Reconciliation

### Refund Processing
1. Request validation
2. Policy check
3. Approval workflow
4. Payment reversal
5. Inventory update
6. Documentation
7. Customer notification

## Release Plan

### Phase 0 (2 weeks)
- Technical architecture
- Data model finalization
- Design system setup
- Integration planning

### Phase 1 (6-8 weeks)
- Core order management
- Basic inventory system
- Authentication/Authorization
- Essential reporting

### Phase 2 (4-6 weeks)
- Advanced analytics
- Automation features
- Performance optimization
- Additional integrations

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Data Inconsistency | Transaction management, reconciliation jobs |
| Integration Failures | Circuit breakers, fallback mechanisms |
| Performance Issues | Caching, optimization, monitoring |
| Security Breaches | Regular audits, penetration testing |
| User Error | Training, validation, confirmation steps |

## Acceptance Criteria

### Functional
- Complete order lifecycle management
- Accurate inventory tracking
- Role-based access control
- Reporting and analytics
- Integration functionality

### Non-Functional
- Performance metrics met
- Security requirements fulfilled
- Reliability targets achieved
- Accessibility compliance
- Documentation complete

---

Document Status: Draft
Review Status: Pending
Next Review Date: October 27, 2025