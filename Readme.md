# 💰 Loan Management System

A modern, full-stack **Loan Management System** built with **React + TypeScript (shadcn/UI)** on the frontend, and two backend services — one in **Node.js + MongoDB** for user management, and another in **Go + PostgreSQL** for loan lifecycle management.


---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **React 18 + TypeScript**
- **shadcn/ui** (for accessible, modern UI components)
- **Vite** or **Next.js** (depending on your setup)
- **Axios / React Query** for API calls
- **Zustand / Context API** for state management

### 🧩 User Service (Node.js + MongoDB)
- **Node.js + Express**
- **MongoDB (Mongoose)** for user profiles, KYC, and authentication
- **JWT Authentication**
- **Role-based access** (Admin / User)
- **API versioning and validation with Zod or Joi**

### 🐹 Loan Service (Go + PostgreSQL)
- **Go (Golang)**
- **Gin** or **Fiber** web framework
- **GORM** or **SQLC** ORM for PostgreSQL
- **Handles full loan lifecycle:**
  - Loan creation
  - Approval / Rejection
  - Disbursement
  - Repayment tracking
  - Interest calculations
- **REST API** exposed for integration with Node service and frontend

---

## 🧠 Key Features

✅ **User Management**
- Signup, Login (JWT)
- Profile and KYC verification
- Role-based authorization

✅ **Loan Lifecycle**
- Create, update, approve, and manage loans
- Record repayments
- Manage due dates and statuses

✅ **Admin Dashboard**
- View all users, loans, and KYC statuses
- Approve / reject loans
- Monitor loan metrics and repayment trends

✅ **UI**
- Built with **shadcn/UI** components for a clean and responsive layout
- Dark/light mode
- Dashboard analytics and notifications




