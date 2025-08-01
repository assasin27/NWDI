# Nareshwadi Backend

This is the backend API for Naresh Wadi Products, an e-commerce platform for organic farm and dairy products.

## Features
- Product, Order, and Customer Management
- Secure Authentication (JWT + Passport.js)
- Payment Gateway Integration (Stripe/PayPal)
- Shipping Provider Integration (USPS/FedEx)
- Inventory Management
- Notifications (Email/SMS)
- API Versioning

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file (see `.env.example`).
3. Run the development server:
   ```sh
   npm run dev
   ```

## Project Structure
- `src/` - Source code
- `models/` - Sequelize models
- `routes/` - Express routes
- `controllers/` - Business logic
- `middlewares/` - Custom middleware
- `config/` - Configuration files

## Requirements
- Node.js 14+
- MySQL

## License
MIT
