# Nareshwadi Products Dual-Portal E-Commerce Platform

## Overview
FarmFresh (Nareshwadi Products) is a modern, production-ready dual-portal e-commerce platform that connects farmers directly to customers. It eliminates middlemen, empowers rural producers, and provides a seamless, secure, and scalable digital marketplace for fresh farm goods.

- **Customer Portal:** Shop, manage cart/wishlist, track orders, and manage addresses.
- **Farmer Portal:** Manage products, orders, inventory, and analytics with real-time updates.
- **Real-time:** All changes are instantly reflected across portals using Supabase.
- **Security:** Enterprise-grade security with Row Level Security (RLS), JWT, and comprehensive testing.

---

## Features

### Customer Portal
- Product catalog with search & filtering
- Shopping cart with persistent storage
- Wishlist system
- Order placement & real-time tracking
- User authentication & address management
- Responsive, mobile-first design

### Farmer Portal
- Secure login (email: `test@nareshwadi.in`, password: `farmer`)
- Dashboard with analytics & quick actions
- Order management with status updates
- Product management (add/edit products, automatic image search)
- Inventory tracking & low-stock alerts
- Export inventory & sales reports
- Real-time synchronization with customer portal

### Technical Features
- Dual authentication (customer & farmer)
- Supabase real-time database & RLS
- Stripe/Razorpay-ready payment integration
- Comprehensive test suite (functionality, security, integration)
- Dockerized deployment & CI/CD ready

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router v6, Lucide React, React Hook Form, Zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Real-time), Django 5.2 (for advanced backend)
- **Infrastructure:** Docker, GitHub Actions, Jest, React Testing Library

---

## Architecture

```
src/
├── pages/
│   ├── LandingPage.tsx              # Portal selection
│   ├── customer/
│   │   └── CustomerPortal.tsx       # Customer portal wrapper
│   └── farmer/
│       ├── FarmerLogin.tsx          # Farmer authentication
│       ├── FarmerDashboard.tsx      # Order management
│       └── AddProduct.tsx           # Product management
├── components/                      # UI components
├── hooks/                           # Custom hooks (cart, wishlist, etc.)
├── lib/                             # Service modules (order, product, cart, wishlist)
└── App.tsx                          # Main routing
```

---

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm
- Python 3.8+ (for backend/Django)
- Supabase account

### 1. Clone the Repository
```bash
git clone <repo-url>
cd <repo-directory>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
- Go to your Supabase dashboard → SQL Editor
- Copy the contents of `database_schema.sql` and run it to create all tables, policies, and indexes.
- See `DATABASE_SETUP.md` for detailed instructions.

### 5. Running the Application
```bash
npm run dev
```
The app will be available at `http://localhost:5173` (or as specified by Vite).

---

## Testing & Security

- **Run all tests:**
  ```bash
  npm test
  # or for backend
  cd backend && python -m pytest
  ```
- **Run security tests:**
  ```bash
  npm run test:security
  # or
  ./run-security-tests.ps1
  ```
- See `COMPREHENSIVE_TEST_SUITE.md` and `SECURITY_README.md` for details.

---

## Deployment

- **Docker Compose:**
  ```bash
  docker compose up --build
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Deploy to GitHub Pages:**
  ```bash
  npm run deploy
  ```
- See `README.Docker.md` for more details.

---

## Contribution

Contributions are welcome! Please open issues or submit pull requests. For major changes, discuss them first via issue.

---

## License

MIT (see LICENSE file)

---

## Contact

- **Developer:** [Your Name]
- **Email:** [Your Email]
- **GitHub:** [Your GitHub Profile]

For business proposals, pricing, and contract details, see `FARMFRESH_PROPOSAL.md` and `FARMFRESH_CONTRACT.md`.

---

**FarmFresh: Revolutionizing agricultural e-commerce with technology, transparency, and trust.**
