# Vehicle Service Management System

A comprehensive, full-stack **Garage & Vehicle Service Management System** designed to streamline automotive repair shop operations. Built with a **React.js** frontend, custom **PHP REST APIs**, and a **MySQL** database, the application handles end-to-end garage workflows—from customer intake and job card creation to stock management, quotations, billing, and multi-branch management.

---

## 🚀 System Architecture & Data Flow

```
┌─────────────────────────┐       HTTP / REST (JSON)       ┌─────────────────────────┐
│     React.js Client     │ ─────────────────────────────> │     PHP REST APIs       │
│  (MUI, Router, Context) │ <───────────────────────────── │ (JWT Middleware, CORS) │
└─────────────────────────┘      Authorization: Bearer     └────────────┬────────────┘
                                                                        │
                                                                 MySQL Queries
                                                                  (mysqli / PDO)
                                                                        │
                                                                        ▼
                                                           ┌─────────────────────────┐
                                                           │     MySQL Database      │
                                                           │   (garage_management)   │
                                                           └─────────────────────────┘
```

---

## ✨ Key Features & Modules

### 1. 📊 Dashboard & Analytics
* **Dual Dashboard Views**: Customized dashboards for **Admin/Manager** (full store metrics) and **Mechanic** (jobs assigned specifically to the logged-in mechanic).
* **Financial & Sales Metrics**: Financial Year (FY) revenue tracking, 4-week sales performance chart, and weekly trends.
* **Operational Overview**: Total count of active customers, registered vehicles, employees, and suppliers.
* **Job Card Tracking**: Real-time counters for *Approval Pending*, *Work In Progress*, and *Completed Services*.

### 2. 🚘 Customer & Vehicle Management
* **Customer Registry**: Create, update, and manage customer profile details.
* **Vehicle Association**: Link multiple vehicles (registration number, brand, model) to customer profiles.
* **Service History**: Historical tracking of previous job cards, quotations, and invoices per vehicle.

### 3. 🛠️ Service & Job Card Management
* **Job Card Creation**: Create detailed job cards assigned to specific vehicles and mechanics.
* **Repair Categories & Tasks**: Select repair categories and individual service tasks (labour).
* **Lifecycle Workflow**: Progress job cards through status stages: `Approval Pending` ➔ `Work In Progress` ➔ `Work Completed` ➔ `Delivered`.

### 4. 📦 Inventory & Stock Management
* **Product Catalog**: Manage spare parts, items, unit prices, unit measurements, and images.
* **Supplier Management**: Register suppliers, contact information, and supplier product mappings.
* **Purchase Orders**: Log inward purchases from suppliers with purchase numbers, purchase dates, quantity, and cost rate.
* **Real-time Stock Math**: Automated stock balance tracking:
  $$\text{Available Stock} = \sum \text{Quantity Purchased} - \sum \text{Quantity Sold}$$
* **Stock Deduction**: Automatic stock log updating when parts are added to invoices.

### 5. 📄 Quotations & Estimations
* **Pre-Service Estimates**: Draft itemized quotations incorporating spare parts and labour charges before starting work.
* **Approval Workflow**: Track status (`Pending`, `Approved`, `Rejected`) and convert approved quotations directly into invoices.

### 6. 💳 Billing & Invoices
* **Invoice Generation**: Convert job cards or quotations into formal invoices with unique invoice numbers (`INV-0001`).
* **Flexible Discounts**: Apply flat rate or percentage-based discounts (`(Parts Subtotal × Discount %) / 100`) specifically to spare parts.
* **GST Handling**: Configurable tax percentage on subtotal amounts.
* **Payment Tracking**: Record partial or full payments, track payment methods (Cash, Card, UPI, Net Banking), calculate remaining balance due, and track payment status (`Paid`, `Unpaid`, `Partial`).

### 7. 🖨️ Dynamic Invoice Printing & PDF Export
* **Custom HTML Print Engine**: Render clean, professional invoice templates dynamically.
* **Native Print / PDF**: Triggers native browser print dialog with direct support for physical printing or saving as PDF.

### 8. 👥 Staff & Worker Management
* **Role Management**: Store and manage profiles for Employees, Support Staff, Accountants, and Mechanics.
* **Worker Details**: Track position, monthly salary, bank account details, shift timings, IFSC codes, and assigned job workloads.

### 9. 🏢 Multi-Branch Management
* **Branch Setup**: Support for multi-branch operation with branch codes, locations, addresses, and Head Office flags.
* **Scoped Visibility**: Data visibility partitioned by primary `admin_guid` across branches.

### 10. ⚙️ Customization & Settings
* **Observation Library**: Standardized pre-defined inspection notes and job observations.
* **Dynamic Dropdowns & Custom Fields**: Custom inputs for flexibility.
* **Profile Settings**: Garage branding, contact info, logo, and header configuration.

---

## 🛠️ Technology Stack

* **Frontend**:
  * **React.js** (v18)
  * **React Router DOM** (v6)
  * **Material-UI (MUI v5)** & `@emotion/react`
  * **Lucide React** & **MUI Icons**
* **Backend**:
  * **PHP** (RESTful API architecture)
  * **Firebase JWT** (`firebase/php-jwt`) for authentication
* **Database**:
  * **MySQL** (`garage_management` database with 23 tables)


---

## 🔒 Security & Access Control (RBAC)

* **Authentication**: Password verification via PHP `password_verify()` with password hashing.
* **JWT Tokens**: HMAC-SHA256 (`HS256`) signed tokens containing `user_guid`, `role_id`, and `permissions` array with a 24-hour expiration limit.
* **Predefined Roles**:
  1. `admin` (Role ID: 1): Complete system access.
  2. `manager` (Role ID: 2): Manage jobs, inventory, products, and workers.
  3. `staff` (Role ID: 3): Limited operational views.
  4. `mechanic` (Role ID: 4): Access restricted to assigned jobs only.
* **Granular Permissions**: 20+ permissions (`view_dashboard`, `view_inventory`, `manage_products`, `manage_purchase`, `manage_stock`, `manage_users`, `view_customers`, `view_employees`, `view_services`, `view_quotations`, `view_invoices`, `view_reports`, `view_branches`, `manage_workers`, `manage_settings`).

---

## 📂 Project Structure

```
Vehicle_Service_Management_System/
├── public/                     # Public static assets
├── src/
│   ├── api/                    # PHP REST API Endpoints & Config
│   │   ├── config.php          # Database connection & JWT configuration
│   │   ├── middleware.php      # JWT authentication middleware
│   │   ├── login.php           # User authentication & token issuance
│   │   ├── dashboard.php       # Analytics and counter queries
│   │   ├── job_card.php        # Job card CRUD operations
│   │   ├── invoice.php         # Invoice processing & sequence generator
│   │   ├── product.php         # Product/Parts catalog API
│   │   ├── purchase.php        # Supplier purchase management API
│   │   ├── stock.php           # Inventory stock tracking API
│   │   ├── quotation.php       # Service quotation API
│   │   ├── usersdata.php       # Users, customers, employees CRUD API
│   │   ├── branches.php        # Multi-branch management API
│   │   └── dump/               # SQL Database Dump (garage_management.sql)
│   ├── apiconfig/              # API endpoints mapping configuration
│   ├── assets/                 # Images & brand assets
│   ├── components/             # React UI Components
│   │   ├── branch/             # Branch forms and tables
│   │   ├── common/             # Sidebar, Navbar, Profile, Global Loader
│   │   ├── Dashboard/          # Admin and Mechanic dashboards
│   │   ├── DynamicComponents/  # Searchable selects & custom fields
│   │   ├── Inventory/          # Products, Purchases, Stock, Suppliers
│   │   ├── Reports/            # Financial & service analytics tabs
│   │   ├── service/            # Service forms & job card views
│   │   └── WorkersManagement/  # Employee management components
│   ├── context/                # React Contexts (Toast, Loading)
│   ├── pages/                  # Page routes (Billing, Customers)
│   │   ├── billing/            # Invoice and quotation pages & Print templates
│   │   └── customer/           # Customer management pages
│   ├── App.js                  # Main React routing & layout entry
│   ├── useAppData.js           # Central state hook for data fetching
│   └── theme.js                # MUI custom design theme
└── package.json                # React dependencies and scripts
```

---

## 🗄️ Database Schema Summary (23 Tables)

The MySQL database `garage_management` contains 23 core relational tables:

1. `users` - Customer, employee, and staff account details
2. `vehicles` - Registered customer vehicle information
3. `customers` - Customer user mappings
4. `employees` - Employee profile, job role, salary, and bank details
5. `job_card` - Service job cards and status tracking
6. `jobcard_sequence` - Sequence auto-increment tracking
7. `quotation` - Customer price estimates
8. `invoice` - Completed billing invoices
9. `products` - Inventory spare parts catalog
10. `purchases` - Stock inward purchase orders
11. `purchase_items` - Purchase order line items
12. `stock` - Real-time stock transaction ledger
13. `suppliers` - Part vendors and suppliers
14. `units_of_measurement` - Unit metrics (Liters, Pieces, Sets, etc.)
15. `roles` - System roles (`admin`, `manager`, `staff`, `mechanic`)
16. `permissions` - System permissions list
17. `role_permissions` - Role-to-permission mapping matrix
18. `profile_crud` - Login credentials and authentication profiles
19. `branches` - Garage branch locations
20. `cities` - City master lookup table
21. `state_master` - State master lookup table
22. `repair_category` - Repair types and service categories
23. `notes` - Standard observation and service notes

---

## 🔌 API Summary (25 Endpoints)

| Endpoint | Method(s) | Description |
| :--- | :--- | :--- |
| `login.php` | `POST` | Authenticate credentials and return signed JWT with user permissions |
| `register.php` | `POST` | User registration |
| `forgotpassword.php` | `POST` | Password reset trigger |
| `dashboard.php` | `GET` | Fetch dashboard analytics, counters, and 4-week sales trends |
| `job_card.php` | `GET`, `POST`, `PUT`, `DELETE` | Full CRUD for service job cards |
| `invoice.php` | `GET`, `POST`, `PUT`, `DELETE` | Invoice listing, creation, and payment updates |
| `quotation.php` | `GET`, `POST`, `PUT`, `DELETE` | Quotation drafting and status updates |
| `product.php` | `GET`, `POST`, `PUT`, `DELETE` | Inventory spare parts CRUD |
| `purchase.php` | `GET`, `POST`, `PUT`, `DELETE` | Vendor purchase orders CRUD |
| `purchaseitem.php` | `GET`, `POST`, `PUT`, `DELETE` | Individual items inside purchase orders |
| `stock.php` | `GET`, `POST`, `PUT`, `DELETE` | Stock balance aggregation & ledger |
| `supplier.php` | `GET`, `POST`, `PUT`, `DELETE` | Vendor/Supplier profile management |
| `usersdata.php` | `GET`, `POST`, `PUT`, `DELETE` | Customer & employee management |
| `worker_management.php` | `GET`, `POST`, `PUT`, `DELETE` | Worker shift and job allocation |
| `workers.php` | `GET` | Fetch active mechanic list for dropdowns |
| `branches.php` | `GET`, `POST`, `PUT`, `DELETE` | Multi-branch management |
| `reports.php` | `GET` | Financial and service analytics reports |
| `unit_measurement.php` | `GET`, `POST`, `PUT`, `DELETE` | Measurement units lookup |
| `locations.php` | `GET` | Cities and states master lookup |
| `dynamic_dropdown.php` | `GET` | Dynamic form dropdown configurations |
| `profile.php` | `GET`, `POST`, `PUT` | Garage profile settings |
| `note.php` | `GET`, `POST`, `PUT`, `DELETE` | Observation library CRUD |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v16 or higher) & **npm**
* **PHP** (v8.0 or higher) with `mysqli` extension enabled
* **MySQL Server** (XAMPP, WAMP, or standalone MySQL Server)
* **Composer** (PHP dependency manager)

---

### Setup Steps

#### 1. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench).
2. Create a new database named `garage_management`:
   ```sql
   CREATE DATABASE garage_management;
   ```
3. Import the database dump located at:
   `src/api/dump/garage_management.sql`

#### 2. Backend Setup (PHP)
1. Ensure your PHP environment (e.g., Apache/Nginx or XAMPP) is running.
2. Navigate to `src/api` directory:
   ```bash
   cd src/api
   ```
3. Install PHP dependencies via Composer:
   ```bash
   composer install
   ```
4. Verify environment database settings in `src/api/config.php` or set environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).

#### 3. Frontend Setup (React)
1. Install Node.js dependencies from the project root:
   ```bash
   npm install
   ```
2. Configure API base URL in `.env` or `src/apiconfig/index.js`:
   ```env
   REACT_APP_API_BASE_URL=http://localhost/Vehicle_Service_Management_System/src/api
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.
