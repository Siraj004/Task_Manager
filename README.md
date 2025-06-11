## 📌 TeamTasker – Role-Based Task Management System

**Live Demo:** 🌐 [https://task-manager-ehbh.onrender.com/](https://task-manager-ehbh.onrender.com/)

---

### 📖 Overview

**TeamTasker** is a full-stack, role-based task and project management system developed as an internship project for **LarkLabs.ai**.
It supports project creation, task assignment, commenting, and fine-grained **RBAC (Role-Based Access Control)** with real-time notifications using **Socket.IO** and **Redis cache** for performance optimization.

---

### 🛠 Tech Stack

#### ✅ Backend

* Node.js + Express.js
* TypeScript
* PostgreSQL + Sequelize ORM
* Redis (for caching using Stash pattern)
* Socket.IO (real-time updates)
* JWT Authentication
* Role-Based Access Control (RBAC)
* REST API

#### ✅ Frontend

* React.js + Vite
* Tailwind CSS
* Context API
* Socket.IO Client
* Protected Routing

---

### ⚙️ Setup Instructions

#### ▶️ Frontend

```bash
cd frontend
npm install
npm start
```

#### ▶️ Backend

```bash
cd backend
npm install
npm run dev
```

> ✅ Make sure to set up `.env` files in both frontend and backend with proper configuration (DB URL, PORT, JWT\_SECRET, etc.)

---

### 🧠 Features

* ✅ Login / Register with JWT Auth
* ✅ Create & manage Projects and Tasks
* ✅ Add Comments to Tasks
* ✅ Assign tasks to users
* ✅ Admin Panel (RBAC system)
* ✅ Real-time updates via Socket.IO
* ✅ Redis Caching using Stash pattern
* ✅ Global Notification System
* ✅ Role-based UI rendering

---

### 🧾 Folder Structure (Backend Highlights)

```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routers/
│   ├── socket/
│   └── utils/
```

### 🧾 Folder Structure (Frontend Highlights)

```
frontend/src/
├── components/
├── context/
├── pages/
├── services/
└── App.js, index.js, etc.
```

---

### 👤 Contributor

> **Sirajudeen G**
> 🧑‍💻 Intern at [LarkLabs.ai](https://larklabs.ai)

---

### 📌 Deployment

* ✅ **Frontend + Backend deployed together** using **Render**
* 🌐 [https://task-manager-ehbh.onrender.com/](https://task-manager-ehbh.onrender.com/)
