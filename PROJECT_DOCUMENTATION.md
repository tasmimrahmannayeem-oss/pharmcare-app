# PharmCare Application Documentation

This document serves as a comprehensive overview of the PharmCare application, detailing the technology stack, the rationale behind these choices, the tools utilized, general architecture, and a breakdown of every page within the system.

---

## 1. Technologies & Languages Used

### Core Languages
*   **JavaScript (ES6+)**: Used continuously across both the frontend and backend.
*   **JSX (JavaScript XML)**: A syntax extension to JavaScript used in React to describe what the user interface should look like (HTML-like syntax inside JavaScript).

### Why did we use it?
*   **Unified Stack (MERN)**: By using JavaScript across both the client-side (frontend) and server-side (backend), we maintain a consistent language, which speeds up development, simplifies data processing (using JSON natively), and makes it easier for developers to work on all parts of the application.
*   **Ecosystem**: The Node/JavaScript ecosystem (NPM) provides a massive library of secure, reliable pre-built packages to handle forms, routing, security, and database connections.

### How did we use it?
*   **Backend**: Node.js executes JavaScript on the server. Express.js acts as the framework to set up RESTful API routes, intercept HTTP requests, and send responses.
*   **Frontend**: React executes inside the user's browser, handling the UI state. When data changes (like adding an item to a cart), React efficiently updates only the parts of the webpage that need to change.

---

## 2. Tools & Frameworks

*   **MongoDB & Mongoose (Database)**: A NoSQL database that stores data in flexible, JSON-like formats. Mongoose is the Object Data Modeling (ODM) library used to enforce schemas (e.g., ensuring a User document always has an email and password). 
*   **Express.js (Backend Framework)**: Used to build the web server and construct the API endpoints (like `/api/auth/login`).
*   **React (Frontend Library) & Vite (Build Tool)**: React is used to build the interactive user interfaces. Vite is used as the build tool because of its extremely fast "Hot Module Replacement" (HMR), making development instantaneous.
*   **JWT (JSON Web Tokens)**: Used for User Authentication. When a user logs in securely, they receive a JWT token, which they attach to future requests to prove their identity and role without having to re-login.
*   **Bcrypt.js**: A cryptographic hashing library. Used to securely encrypt passwords before they are saved to the database.
*   **Multer**: Handling `multipart/form-data`. Used primarily to allow users to upload images of their medical prescriptions.
*   **MongoDB Memory Server**: Included for development/testing purposes, spinning up a local, in-memory MongoDB database automatically if an online Atlas cluster is unavailable.

---

## 3. How the Website Works (Architecture)

PharmCare operates on a client-server architecture:
1.  **The Client (Frontend)**: The user visits the React website in their browser. They interact with forms, buttons, and pages.
2.  **The Request**: When a user needs data (e.g., viewing their profile) or sends data (e.g., placing an order), the React frontend sends an HTTP request (using Fetch or Axios) to the Express.js backend.
3.  **The Server & Security (Backend)**: the Express server receives the request. It checks if the user is authorized (verifying the JWT token). 
4.  **Database Query**: The server uses Mongoose to ask MongoDB for the specific data or inserts new data.
5.  **The Response**: The server sends a JSON response back to the frontend. React takes this new data and updates the UI instantly.

The system is highly **Role-Based**. Upon logging in, a user's role (`Customer`, `Pharmacist`, `Admin`, `Super Admin`, `Supplier`) determines exactly which pages they are allowed to see and what actions they can perform.

---

## 4. Pages and Their Functionality

The application is broken down into structured views (pages) found in `src/pages`. Here is what each page contains and how it works:

### Public & Authentication
*   **Home.jsx**: The main landing page. Introduces the application, displays featured medicines, and prompts users to log in or register.
*   **Login.jsx**: The unified authentication portal. Users enter their credentials. Based on their database role, they are redirected to their respective personalized dashboard upon success.

### Customer Interface
*   **MedicineSearch.jsx**: A search engine interface allowing customers to look up medicines by generic name, brand, or category.
*   **ProductCatalogue.jsx**: A browsing view listing the full inventory of available health products.
*   **Checkout.jsx**: The final step of the cart system where customers review their items, select a pharmacy branch, provide shipping details, and finalize the order.
*   **OrderTracking.jsx**: An interface where customers can input or view their order IDs to see the real-time fulfillment state (Processing, Verified, Out for Delivery, etc.).
*   **CustomerProfile.jsx**: A personalized hub containing the user's demographic information, saved addresses, and past order history.

### Pharmacist & Operational Tools
*   **POSBilling.jsx (Point of Sale)**: A vital screen for in-store operations. Pharmacists use this to scan/search items, add them to a temporary cart, apply discounts, and process walk-in customer payments.
*   **PrescriptionQueue.jsx**: A list view showing all pending orders that require a valid medical prescription before they can be fulfilled.
*   **PrescriptionVerification.jsx**: The detailed view where a pharmacist visually inspects an uploaded prescription image and either approves or rejects the order based on medical validity.
*   **Inventory.jsx**: The primary stock management screen. Pharmacists can update stock counts, add new medicine variants, and edit prices.
*   **InventoryReports.jsx**: An analytical page that highlights critical inventory metrics, such as low-stock alerts, out-of-stock items, and soon-to-expire medicines.

### Administration & Analytics
*   **PharmacyManagement.jsx**: Used by Admins to register and configure different physical pharmacy branches within the network.
*   **PharmacyAdminDashboard.jsx**: An analytical dashboard for branch managers showing daily sales, completed orders, and active staff performance for their specific branch.
*   **SuperAdminDashboard.jsx**: The highest-level overview. Shows aggregate revenue, network-wide statistics, and system health for the platform owners.
*   **SalesAnalytics.jsx**: Deep-dive graphs and charts breaking down revenue by days, categories, or branches.
*   **StaffManagement.jsx**: Allows managers to view their employees, assign branches, edit salaries, or suspend accounts.
*   **UserManagement.jsx**: A system-wide table for tracking registered users across the platform.
*   **SystemAuditLog.jsx**: A security and compliance page that logs critical actions (who deleted an item, who gave a refund, etc.).

### Supplier & Supply Chain
*   **SupplierDashboard.jsx**: A specialized landing page for wholesale suppliers, highlighting pending supply requests and their historical delivery count.
*   **SupplierManagement.jsx**: Allows Admins to add new pharmaceutical suppliers to the system, managing their contact info and contracts.
*   **SupplierPurchaseOrders.jsx**: The interface bridging pharmacies and suppliers, tracking the status of stock requests (Requested -> Accepted -> Delivered).
