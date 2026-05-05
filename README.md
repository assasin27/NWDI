# FarmFresh Dual-Portal E-Commerce Platform

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

## 5.2 Project Module Details

The system is divided into several interdependent modules, each responsible for a specific set of functionalities. The modular design promotes scalability, maintainability, and easier integration of new features in the future.

### 1. Authentication Module
The Authentication Module manages user registration, login, and secure access throughout the platform. The Nareshwadi e-commerce platform uses Supabase Auth to handle user authentication and security. Users can sign up and log in using email and password, providing a simple and reliable way to access the platform. The system ensures secure session management, keeping users logged in while protecting against unauthorized access. Role-based access control is implemented so that only authorized users can access specific features, and sensitive routes are protected to prevent misuse. To safeguard user information, all credentials are stored with hashed passwords, maintaining data confidentiality and minimizing the risk of breaches. This approach ensures a safe, secure, and seamless experience for all users.

### 2. Product Management Module
The Product Management Module serves as the core component for handling all product-related operations on the Nareshwadi e-commerce platform. It allows users to browse products easily through listing pages with search, category-based filtering, and sorting options, ensuring a smooth and intuitive shopping experience. Each product has a detailed page displaying essential information such as name, description, price, images, stock level, and category. For administrators, the module provides functionality to add, edit, or remove products, enabling efficient management of the product catalog. All product data is securely stored in a PostgreSQL database and accessed through Supabase APIs, ensuring real-time updates, data consistency, and reliable performance across the platform. This module ensures that the product catalog remains consistent, up-to-date, and efficiently searchable for users.

### 3. Shopping Cart Module
The Shopping Cart Module is an essential component of the Nareshwadi e-commerce platform, designed to provide users with a seamless and interactive way to manage their purchases before proceeding to checkout. It allows users to add products to the cart, modify item quantities, or remove unwanted items, while the total cost dynamically updates to reflect these changes in real time. This ensures transparency and keeps users fully informed about their order as they shop.
The module also focuses on reliability and user convenience. Each user's cart data is persistently stored in the database, meaning items remain saved even if the user refreshes the page, switches devices, or logs out and returns later. This persistent storage helps prevent frustration and encourages users to continue shopping without fear of losing their selections. 
In addition to functionality, the module enhances the overall shopping experience by providing instant feedback for every action, such as adding or removing items, which makes the platform feel responsive and engaging. By combining real-time updates, secure data handling, and an intuitive interface, the Shopping Cart Module not only simplifies the purchasing process but also builds trust and confidence among users, ensuring they have full control over their shopping journey from start to finish.

### 4. Wishlist Module
The Wishlist Module provides users with a convenient way to save products they are interested in for future purchases. Users can easily add items to their wishlist or remove them as needed, and they can view their saved products anytime after logging in. This functionality allows customers to keep track of items they like without having to search for them again, making the shopping experience more organized and user-friendly.
All wishlist data is securely stored in the database and linked to each individual user account, ensuring persistence across sessions. Even if users log out or access the platform from a different device, their saved items remain intact. This persistent storage enhances reliability and encourages repeat engagement.
By enabling customers to track and revisit their preferred products, the Wishlist Module not only improves user experience but also helps increase the likelihood of future purchases, supporting customer retention and overall sales growth. Its combination of ease-of-use, secure data handling, and persistent functionality makes it a key feature for fostering long-term engagement on the Nareshwadi e-commerce platform.

### 5. User Interface Module
The User Interface (UI) Module is dedicated to creating a responsive, intuitive, and visually appealing front-end design for the Nareshwadi e-commerce platform. Built using React and Tailwind CSS, the module focuses on delivering a seamless user experience across a variety of devices, from desktops and laptops to tablets and smartphones.
The interface features a clean and modern design, with responsive layouts that automatically adjust to different screen sizes. Reusable components such as product cards, navigation bars, search bars, and action buttons are implemented to maintain consistency across the platform while enabling faster development and easier maintenance.
Beyond aesthetics, the UI Module emphasizes usability, accessibility, and performance, ensuring that users can navigate the platform effortlessly, find products quickly, and complete actions smoothly. By combining modern design principles with functional, responsive components, this module creates a consistent and enjoyable shopping experience, enhancing user satisfaction and engagement on the platform.

### 6. Database Module
The Database Module serves as the backbone of the Nareshwadi e-commerce platform, managing and storing all critical data required for smooth operation. Built using PostgreSQL and managed through Supabase, this module ensures reliable, secure, and efficient data handling for the platform. The database stores key data entities, including users, products, shopping carts, and wishlist items. Relationships between these entities are carefully defined using foreign keys, maintaining referential integrity and ensuring that all data remains consistent and accurate. Additionally, Row-Level Security (RLS) is implemented to enforce strict access controls, allowing users to access only their own data and preventing unauthorized access.
To maintain data integrity, the module uses relational constraints and validation rules, ensuring that all operations comply with the defined schema and business rules. This not only safeguards the accuracy of user and transactional data but also provides a robust foundation for all other modules, from order processing to analytics. By combining secure storage, structured relationships, and rigorous access control, the Database Module guarantees reliable performance and protects sensitive information, forming a crucial part of the platform's overall architecture.

  ### 7. ML Freshness Detection Module
  The ML Freshness Detection Module leverages advanced machine learning and computer vision technology to provide real-time assessment of fruit and vegetable freshness directly through the user's camera. This innovative module opens the device camera to capture images of produce, which are then analyzed using a pre-trained convolutional neural network (CNN) model. The system compares the captured image against a comprehensive dataset of fresh and ripe produce samples, evaluating key indicators such as color, texture, shape, and surface characteristics to determine freshness levels.
  The module provides instant feedback with a freshness score percentage and detailed classification (e.g., "Very Fresh", "Fresh", "Ripe", "Overripe"). It also identifies specific quality issues like bruising, mold, or spoilage. The ML model is continuously updated with new training data to improve accuracy across various produce types including fruits, vegetables, and herbs. Integration with the product catalog allows the system to automatically suggest optimal consumption timelines and storage recommendations based on the detected freshness level. This module not only enhances customer confidence in product quality but also reduces food waste by helping users make informed purchasing decisions and better manage their produce consumption.

  ### 8. AI Chatbot Negotiation Module
  The AI Chatbot Negotiation Module introduces an intelligent conversational assistant that engages customers in dynamic price negotiations for bulk purchases and special orders. Powered by natural language processing (NLP) and machine learning algorithms, the chatbot understands customer inquiries, analyzes order quantities, and applies intelligent pricing strategies based on predefined business rules, market conditions, and inventory levels.
  The module features a sophisticated dialogue management system that can handle complex negotiation scenarios, including bulk discounts, seasonal pricing adjustments, and special promotional offers. The AI agent is trained on historical sales data and customer behavior patterns to optimize negotiation outcomes while maintaining profitability. It can process multiple negotiation parameters simultaneously, such as order volume, delivery timeline, payment terms, and product combinations.
  The chatbot provides transparent explanations for pricing decisions, builds customer trust through fair negotiation practices, and can seamlessly escalate complex cases to human representatives when needed. Integration with the inventory management system ensures that negotiated prices respect stock availability and supply constraints. This module not only enhances the shopping experience by providing personalized pricing but also increases sales conversion rates and customer satisfaction through intelligent, context-aware negotiations.

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

## 6.2 System Implementation

The implementation of the e-commerce platform involved the integration of multiple modules into a unified system that offers a smooth and responsive shopping experience. The design emphasizes usability, performance, and real-time data synchronization across all user interactions.

### 1. Home Page
The Home Page serves as the main entry point to the platform. It showcases a variety of products, including featured and newly added items. Users can easily browse through product categories, search for specific items, or navigate to other sections of the site such as the Cart, Wishlist, and User Profile pages.
The layout is designed to be clean and intuitive, with clear navigation menus and visually appealing product cards that enhance the overall shopping experience.

### 2. Product Listing Page
The Product Listing Page displays all available products in a grid layout. Each product card includes the product image, name, price, and a short description, making it easy for users to compare products at a glance.
Additional features include:
- **Filtering:** Users can filter products based on categories.
- **Sorting:** Options to sort products by price or relevance.
- **Actions:** Each product card includes "Add to Cart" and "Add to Wishlist" buttons for quick interaction.
This page provides an efficient and user-friendly interface for browsing large product collections.

### 3. Product Details Page
When a user selects a product, they are directed to the Product Details Page, which provides comprehensive information about the item.
Displayed information includes:
- **Product images** (supporting multiple views)
- **Detailed description and specifications**
- **Price and stock availability**
- **Action buttons** to add the product to the cart or wishlist
This page helps users make informed purchasing decisions by providing all essential details in one place.

### 4. Shopping Cart
The Shopping Cart Page allows users to review and manage the items they intend to purchase.
Key features include:
- **Display of all added items** with product images, quantities, and prices
- **Ability to update quantities** or remove unwanted items
- **Automatic calculation** of the total amount
- **A Checkout button** that initiates the purchase process
All cart actions are reflected in real time, ensuring that users always see the most up-to-date cart information.

### 5. Wishlist
The Wishlist Page provides users with a convenient way to save products for future consideration.
Key features include:
- **Display of all products** added to the wishlist
- **Options to move items** from the wishlist to the cart
- **Ability to remove products** from the wishlist
Wishlist items are saved persistently in the database and remain available even after logging out, allowing users to revisit their saved products at any time.

### 6. User Authentication
The Authentication Module ensures secure access and personalized user experiences.
It includes:
- **Registration Page:** Allows new users to sign up using their email and password.
- **Login Page:** Authenticates returning users and grants access to their personalized data (cart, wishlist, etc.).
- **Session Management:** Maintains user sessions securely, so users remain logged in across page visits.
Once a user successfully logs in, they are redirected to the Home Page. Authentication and session management are handled by Supabase Auth, ensuring secure and efficient identity handling.

### 7. Database Integration
All application data such as users, products, shopping carts, and wishlists is managed through Supabase, which utilizes a PostgreSQL database.
Key database implementation details include:
- **Supabase API Calls:** The frontend communicates with the backend using Supabase's real-time API services.
- **Data Storage:** Products, cart items, and wishlist data are stored in structured tables with defined relationships.
- **Real-Time Synchronization:** Any change in data (e.g., adding an item to the cart) is reflected instantly across the application, ensuring a consistent user experience.
- **Data Security:** Row-Level Security (RLS) policies are enforced to ensure that users can only access their own data.

### 8. ML Freshness Detection Implementation
The ML Freshness Detection Module is implemented as an integrated feature that provides real-time quality assessment of produce through the user's device camera.
Key implementation details include:
- **Camera Integration:** Utilizes WebRTC API to access device camera with user permission, capturing high-quality images for analysis.
- **CNN Model Deployment:** A pre-trained convolutional neural network model is deployed using TensorFlow.js, enabling client-side inference for immediate results.
- **Real-time Processing:** Images are processed directly in the browser, analyzing color histograms, texture patterns, and surface features to determine freshness levels.
- **Freshness Scoring Algorithm:** The system calculates a comprehensive freshness score (0-100%) based on multiple visual indicators including color vibrancy, surface texture, and structural integrity.
- **Quality Issue Detection:** Identifies specific problems such as bruising, mold growth, dehydration, or over-ripeness with confidence scores for each detection.
- **Storage Recommendations:** Based on the freshness assessment, the system provides personalized storage advice and estimated consumption timelines.
- **Product Catalog Integration:** Freshness data is linked to product information, allowing users to compare quality across similar items and make informed purchasing decisions.

### 9. AI Chatbot Negotiation Implementation
The AI Chatbot Negotiation Module is implemented as an intelligent conversational interface that handles dynamic pricing discussions and bulk purchase negotiations.
Key implementation details include:
- **Natural Language Processing:** Utilizes transformer-based NLP models to understand customer inquiries, extract negotiation parameters, and maintain context throughout conversations.
- **Dialogue Management System:** Implements a state-machine-based conversation flow that can handle complex negotiation scenarios with multiple variables and decision points.
- **Pricing Engine:** An intelligent pricing algorithm that considers factors such as order volume, seasonal demand, inventory levels, and historical sales data to generate optimal pricing strategies.
- **Real-time Negotiation Logic:** Processes multiple negotiation parameters simultaneously including order quantity, delivery timeline, payment terms, and product combinations.
- **Business Rules Integration:** Incorporates predefined business constraints, minimum margin requirements, and promotional rules to ensure profitable negotiations.
- **Inventory Awareness:** Seamlessly integrates with the inventory management system to validate stock availability and prevent overselling during negotiations.
- **Escalation Protocol:** Automatically detects complex scenarios beyond AI capabilities and provides smooth handoff to human representatives with full conversation context.
- **Transparency Features:** Provides clear explanations for pricing decisions and discount calculations, building customer trust through open communication.
- **Learning System:** Continuously improves negotiation outcomes through machine learning based on successful deals and customer feedback patterns.

---

## 6.3 Admin Portal Capabilities

The developed admin portal effectively resolves the initial challenges identified during the project's requirement analysis. It introduces a streamlined order management system that automates processing and tracking, significantly reducing manual effort and errors. The inclusion of real-time inventory control ensures that stock levels are constantly updated, preventing inconsistencies and enabling timely restocking decisions. Additionally, the portal provides comprehensive analytics that offer valuable insights into sales performance, customer activity, and operational efficiency. Strong security and access control mechanisms including role-based permissions and activity monitoring further ensure that sensitive business data remains protected and accessible only to authorized personnel.

### Advanced ML-Powered Quality Management
The admin portal leverages cutting-edge machine learning capabilities to revolutionize quality control and product management:

- **Automated Freshness Monitoring:** The ML freshness detection system provides administrators with real-time quality assessments of all produce items. The dashboard displays comprehensive freshness scores, quality trends over time, and alerts for products approaching spoilage thresholds.

- **Quality Analytics Dashboard:** Administrators can view detailed analytics on product quality patterns, identify suppliers with consistently high-quality produce, and track freshness metrics across different product categories and seasons.

- **Predictive Spoilage Alerts:** Using historical data and current freshness assessments, the ML system predicts potential spoilage events, enabling proactive inventory management and discount strategies to minimize waste.

- **Quality-Based Pricing Recommendations:** The system suggests dynamic pricing adjustments based on freshness levels, helping administrators optimize revenue while maintaining customer satisfaction through transparent quality communication.

- **Supplier Performance Tracking:** ML algorithms analyze freshness data by supplier, providing objective performance metrics that inform procurement decisions and supplier negotiations.

### Intelligent AI Chatbot Integration
The AI chatbot system extends the admin portal's capabilities with sophisticated automation and customer engagement features:

- **Negotiation Analytics:** Administrators can review comprehensive analytics on chatbot negotiation outcomes, including success rates, average discount levels, deal conversion rates, and customer satisfaction metrics.

- **Pricing Strategy Optimization:** The AI system provides administrators with data-driven recommendations for pricing strategies based on negotiation patterns, market demand, and competitive analysis.

- **Automated Bulk Order Processing:** The chatbot handles bulk purchase inquiries automatically, applying predefined rules and machine learning insights to generate quotes and close deals without human intervention.

- **Customer Behavior Insights:** Advanced NLP analysis reveals customer preferences, price sensitivity patterns, and negotiation tactics, enabling administrators to refine business strategies and improve customer relationships.

- **Escalation Management:** The system intelligently routes complex negotiations to human representatives while providing complete conversation context and AI-generated recommendations for optimal outcomes.

- **Revenue Impact Analysis:** Administrators can track the direct revenue impact of AI-powered negotiations, comparing performance against traditional sales methods and identifying opportunities for improvement.

### Enhanced Operational Efficiency
The combination of ML and AI technologies creates a synergistic effect that dramatically improves operational efficiency:

- **Reduced Manual Quality Inspection:** Automated freshness detection eliminates the need for manual quality checks, saving time and reducing human error while providing more consistent and objective assessments.

- **Intelligent Inventory Management:** The integration of freshness predictions and negotiation data enables more sophisticated inventory planning, reducing waste and maximizing profitability.

- **Data-Driven Decision Making:** Administrators have access to unprecedented levels of insight into both product quality and customer behavior, enabling strategic decisions that drive business growth.

- **Scalable Customer Service:** The AI chatbot handles unlimited concurrent negotiations, allowing the business to scale customer interactions without proportional increases in staffing costs.

- **Continuous Improvement:** Both ML and AI systems learn from ongoing operations, continuously improving their accuracy and effectiveness over time.

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

## Conclusion

The FarmFresh Nareshwadi e-commerce platform represents a transformative leap forward in agricultural commerce, seamlessly integrating traditional farming values with cutting-edge technology. By implementing a comprehensive modular architecture that encompasses advanced machine learning for freshness detection and sophisticated AI-powered negotiation capabilities, the platform addresses critical challenges in the agricultural supply chain while creating unprecedented value for both farmers and customers.

The innovative ML freshness detection module revolutionizes quality assurance by providing objective, real-time assessments of produce quality, significantly reducing food waste and building consumer confidence through transparency. Meanwhile, the AI chatbot negotiation system introduces intelligent, context-aware pricing that optimizes revenue while enhancing customer satisfaction through personalized interactions. These technological advancements, combined with robust authentication, real-time inventory management, and comprehensive analytics, create a holistic ecosystem that empowers farmers with data-driven insights and provides customers with unparalleled shopping experiences.

The platform's success demonstrates how thoughtful application of modern technologies can solve real-world problems in traditional industries. By eliminating middlemen, ensuring fair pricing through intelligent negotiations, and maintaining product quality through automated monitoring, FarmFresh creates a more equitable and efficient agricultural marketplace. The scalable architecture and continuous learning capabilities ensure that the platform will evolve with changing market demands and technological advancements, positioning it as a sustainable solution for the future of agricultural e-commerce.

This implementation serves as a blueprint for how technology can bridge gaps in traditional supply chains, fostering direct connections between producers and consumers while maintaining the highest standards of quality, security, and user experience. The FarmFresh platform not only meets current market needs but anticipates future trends, setting new standards for innovation in agricultural technology and e-commerce.

---

## Future Scope

The Nareshwadi e-commerce platform has significant potential for future expansion and improvement. One promising direction is the integration of advanced analytics powered by artificial intelligence to provide deeper insights into customer behavior, sales patterns, and product demand beyond the current ML implementations. This would enable the system to make more sophisticated data-driven recommendations and optimize decision-making processes.

The development of a dedicated mobile application is another key enhancement, allowing both customers and administrators to access the platform conveniently from their smartphones, thereby improving accessibility and user engagement. The mobile app could leverage device-specific features like push notifications for real-time updates and offline capabilities for areas with limited connectivity.

Additionally, incorporating automated inventory forecasting could help predict stock requirements based on historical sales data and seasonal trends, reducing the risk of overstocking or shortages. This system would integrate seamlessly with the existing freshness detection module to optimize inventory rotation based on product shelf life.

Enhanced reporting features would enable more detailed and visually informative reports, supporting better monitoring of business performance and operational efficiency. These could include interactive dashboards, customizable KPI tracking, and predictive analytics for business planning.

Other potential future enhancements include:
- **Blockchain Integration:** Implementing blockchain technology for supply chain transparency and traceability, allowing customers to verify the origin and journey of their purchases.
- **IoT Sensor Integration:** Connecting with IoT devices in farms and warehouses to monitor environmental conditions and automate quality control processes.
- **Multi-language Support:** Expanding the platform to support multiple regional languages to serve a broader customer base.
- **Advanced Delivery Optimization:** Implementing route optimization algorithms and real-time delivery tracking to improve logistics efficiency.
- **Supplier Marketplace:** Creating a B2B marketplace where multiple farmers and suppliers can connect with buyers, expanding the platform's ecosystem.
- **Subscription Services:** Introducing subscription-based models for regular deliveries of fresh produce, providing predictable revenue streams.
- **Community Features:** Adding social features like recipe sharing, cooking tips, and farmer profiles to create a more engaging community around the platform.

These future upgrades would further strengthen the platform's functionality, scalability, and overall impact, positioning FarmFresh as a comprehensive solution for agricultural e-commerce.

---

**FarmFresh: Revolutionizing agricultural e-commerce with technology, transparency, and trust.**
