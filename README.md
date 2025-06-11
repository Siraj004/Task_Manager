
# 🧠 TeamTasker – Project Management Web App

A full-stack Role-Based Task & Project Management System built using **Node.js, Express, PostgreSQL, Redis, and React**. This application includes role-based access control (RBAC), real-time collaboration via **Socket.IO**, and performance improvements using **Redis (Stash)** for intelligent caching.

---

## 🚀 Getting Started

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

---

## ⚙️ Tech Stack

### Backend
- **Node.js**, **Express.js**
- **TypeScript**
- **PostgreSQL** (ORM: Sequelize)
- **Redis (Stash)** for caching tasks and comments
- **Socket.IO** for real-time task updates and notifications
- **RBAC**: Role-Based Access Control (Admin, Manager, Member)
- **JWT Authentication**

### Frontend
- **React.js**
- **Tailwind CSS**
- **Context API** for auth and socket state
- **Socket.IO Client** for live updates
- **Global Notification Popup**

---

## 📁 Project Structure

### Backend (`/backend/src`)
```
.
├── config/            # DB and Redis config
├── controllers/       # Route handlers (auth, tasks, comments)
├── middlewares/       # Auth, roles, permissions
├── models/            # Sequelize models
├── routes/            # Route definitions
├── socket/            # Socket.IO server setup
├── utils/             # Seeder, Redis cache logic
├── app.ts             # Express app setup
├── index.ts           # Server entry with socket + DB init
```

### Frontend (`/frontend/src`)
```
.
├── components/        # Reusable UI components
├── context/           # Auth & Socket contexts
├── pages/             # Main views (Dashboard, ProjectBoard, etc.)
├── services/          # API handlers
├── App.js             # Routes and context wrapper
```

---

## 📡 Real-Time Features

- **Live Task Creation**  
- **Live Task Updates and Status Changes**  
- **Real-Time Comments on Tasks**  
- **Global Notification Popup with Count**  
- **Per-Project Room Broadcasting**  
- **Per-User Notification for Task Assignments**

---

## 🧠 Caching with Redis

- **Redis** is used to cache:
  - Project tasks
  - Task comments
- Cache is **invalidated** on:
  - Task create/update
  - Comment add/delete

---

## 🙋‍♂️ Contributor

> 👨‍💻 **Sirajudeen G**  
> 🏢 Intern at [LarkLabs.ai](https://larklabs.ai)

---

## 📜 .env Configuration

Create a `.env` file in `/backend` and `/frontend` root:

### Backend `.env`
```env
PORT=5000
DATABASE_URL=postgres://<user>:<password>@localhost:5432/<dbname>
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📌 Requirements

- Node.js v18+
- PostgreSQL
- Redis
- Yarn or npm
- VS Code with ESLint and Prettier (recommended)

---

## 📷 Screenshots

Coming soon...

---

## 📄 License

This project is under development as an internal internship project and is not yet licensed for public use.

---
