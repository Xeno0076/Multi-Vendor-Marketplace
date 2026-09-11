# Marketly – Multi-Vendor E-Commerce Platform

Marketly is a full-stack multi-vendor e-commerce platform where users can browse products, manage their cart, place orders, and view order history.

## Features

- User registration and login
- Customer and seller roles
- Product catalog
- Product search and category filtering
- Product details
- Add to cart
- Update and remove cart items
- Checkout and order placement
- Automatic stock updates
- Order history and order details
- Responsive UI for desktop and mobile

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- REST API

## Main User Flow

```text
Login/Register
      ↓
Browse Products
      ↓
View Product
      ↓
Add to Cart
      ↓
Checkout
      ↓
Place Order
      ↓
Order History

Database
Main entities:
Users
Sellers
Categories
Products
Carts
Cart Items
Orders
Order Items


• Project Structure

artifacts/
├── marketplace/     # React frontend
└── api-server/      # Express backend

✓ Getting Started

•Pre-requisites
Make sure the following are installed:

Node.js
pnpm
PostgreSQL

•Installation
Clone the repository:
git clone
 <YOUR_GITHUB_REPOSITORY_URL>

Navigate to the project directory:
cd marketly-multi-vendor-ecommerce

Install dependencies:
pnpm install

•Environment Variables
Create a .env file for local development and configure the required database and application environment variables.

Example:
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_session_secret
Do not commit .env files or other secrets to the repository.
Running the Application
Start the development environment:
pnpm dev
The application will start the frontend and backend development services.

• Future Improvements

Seller dashboard
Online payment integration
Product reviews and ratings
Wishlist
Admin dashboard
Advanced order management
Project Status
Completed – Core E-Commerce MVP

• Author

Manish
B.Tech Computer Science & IT

