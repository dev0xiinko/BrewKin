# Coffee Project: User & Store Owner Guide

Welcome to the Coffee Project! This guide provides instructions for both regular users (customers) and store owners (administrators) on how to use and manage the system.

---

## Table of Contents
- [Coffee Project: User \& Store Owner Guide](#coffee-project-user--store-owner-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [For Users (Customers)](#for-users-customers)
    - [Browsing the Menu](#browsing-the-menu)
    - [Placing Orders](#placing-orders)
    - [Managing Your Account](#managing-your-account)
    - [Cart \& Checkout](#cart--checkout)
    - [Order History](#order-history)
    - [Feedback \& Reviews](#feedback--reviews)
  - [For Store Owners (Admins)](#for-store-owners-admins)
    - [Admin Dashboard](#admin-dashboard)
    - [Managing Products](#managing-products)
    - [Order Management](#order-management)
    - [Supplier \& Supply Management](#supplier--supply-management)
    - [User Management](#user-management)
    - [Viewing Feedback](#viewing-feedback)
  - [Admin Step-by-Step Tutorial](#admin-step-by-step-tutorial)
    - [1. Logging In as Admin](#1-logging-in-as-admin)
    - [2. Accessing the Admin Dashboard](#2-accessing-the-admin-dashboard)
    - [3. Managing Products](#3-managing-products)
    - [4. Managing Orders](#4-managing-orders)
    - [5. Managing Suppliers \& Supplies](#5-managing-suppliers--supplies)
    - [6. Managing Users](#6-managing-users)
    - [7. Viewing Product Feedback](#7-viewing-product-feedback)
    - [8. Logging Out](#8-logging-out)
  - [Offline Support \& PWA](#offline-support--pwa)
  - [Support](#support)

---

## Overview
The Coffee Project is a web-based platform for ordering coffee and related products. It supports both customer-facing features and an admin dashboard for store management. The system is built with Next.js and supports offline usage as a Progressive Web App (PWA).

---

## For Users (Customers)

### Browsing the Menu
- Visit the `/menu` page to view available products.
- Click on a product card for more details.

### Placing Orders
- Add items to your cart from the menu.
- Go to the `/cart` page to review your selections.
- Proceed to `/checkout` to place your order.

### Managing Your Account
- Sign up or log in via `/auth/sign-up` or `/auth/login`.
- Access your account details at `/account`.

### Cart & Checkout
- View and edit your cart at `/cart`.
- Complete your purchase at `/checkout`.
- Orders can be placed even when offline; they will sync when you reconnect.

### Order History
- View your past orders at `/orders`.
- Click on an order for details.

### Feedback & Reviews
- Leave feedback on products after purchase.
- View feedback on product pages.


## For Store Owners (Admins)

### Admin Dashboard

### Managing Products

### Order Management

### Supplier & Supply Management

### User Management

### Viewing Feedback


## Admin Step-by-Step Tutorial

This section provides a hands-on walkthrough for store owners/admins to manage the system efficiently.

### 1. Logging In as Admin
- Go to `/auth/login` and enter your admin credentials.
- If you do not have admin access, contact the system administrator.

### 2. Accessing the Admin Dashboard
- After logging in, navigate to `/admin`.
- You will see the main dashboard with navigation links to Orders, Products, Suppliers, Supplies, and Users.

### 3. Managing Products
- Click on "Products" in the admin sidebar or go to `/admin/products`.
- To add a new product, click "Add Product" and fill in the required details (name, price, description, image, etc.), then save.
- To edit a product, click the "Edit" button next to the product, update the fields, and save.
- To remove a product, click the "Delete" button and confirm.

### 4. Managing Orders
- Click on "Orders" or go to `/admin/orders`.
- View the list of all orders, including their status (pending, processing, completed).
- Click on an order to see details and update its status as needed.

### 5. Managing Suppliers & Supplies
- Go to `/admin/suppliers` to add, edit, or remove suppliers.
- Go to `/admin/supplies` to track inventory and update supply records.

### 6. Managing Users
- Go to `/admin` and select the "Users" section.
- View all registered users, update their information, or grant admin rights if necessary.

### 7. Viewing Product Feedback
- In the "Products" section, select a product to view customer feedback and reviews.
- Use this feedback to improve products and service.

### 8. Logging Out
- Click the logout button in the admin dashboard to securely end your session.

---

## Offline Support & PWA
- The app works offline and can be installed as a PWA.
- Orders and feedback made offline will sync automatically when you reconnect.
- Look for the install prompt or use your browser's "Add to Home Screen" feature.

---

## Support
- For help, contact the store owner or refer to the documentation.
- For technical issues, please open an issue or contact the development team.

---

Enjoy your coffee experience!
