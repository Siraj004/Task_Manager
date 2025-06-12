# Role-Based Project Collaboration Full-Stack System (Team Tasker)

A full-stack project collaboration platform featuring **role-based task management**, **real-time updates**, **RBAC authorization**, and **Redis-powered caching**. Designed to streamline team workflows in engineering/product teams.

---

##  Overview

**TeamTasker** is a web application that enables teams to manage projects, assign tasks, leave comments, and track progress in real time. It supports fine-grained access control for different roles: `Admin`, `Project Manager`, `Developer`, `Tester`, and `Viewer`.If a new person sign up,He/She will automatically get assigned for viewer role

---

##  Features

- Role-Based Access Control (RBAC) using custom middleware
- JWT Authentication for secure sessions
- Task Creation, Editing, and Commenting with permission-based restrictions
- Role-specific dashboards and actions
- Socket.IO integration for live task updates and comment feeds
- Redis (Stash) caching for faster DB access and reduced load
- Project-wise task management with assignee filtering
- Real-time popup notifications for task assignments and updates
- REST API security with Express middleware chaining

---

##  Roles & Permissions

| Role                | View | Create Tasks | Edit Tasks | Delete Tasks | Comment | Mark as Tested |
|---------------------|------|--------------|------------|---------------|---------|----------------|
|   Admin             | ✅   | ✅           | ✅        | ✅           | ✅     | ✅             |
|   Project Manager   | ✅   | ✅           | ✅        | ✅           | ✅      | ❌            |
|   Developer         | ✅   | ❌           | ✅        | ❌           | ✅      | ❌            |
|   Tester            | ✅   | ❌           | ✅        | ❌           | ✅      | ✅            |
|   Viewer            | ✅   | ❌           | ❌        | ❌           | ❌      | ❌            |

---

##  Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend     | React.js + Tailwind CSS + Shadcn UI     |
| Backend      | Node.js + Express.js + TypeScript       |
| Database     | PostgreSQL (via Sequelize ORM)          |
| Cache        | Redis (via Stash)                       |
| Auth         | JWT (Access & Refresh Tokens)           |
| Realtime     | Socket.IO for instant client sync       |
| Deploy       | Render (Backend & Frontend deployment)  |

---

## Challenges & Solutions

 Challenge: Real-Time Task Updates
Solution: Integrated Socket.IO on both client and server sides to emit and receive events when tasks or comments are created or modified.

Challenge: Repeated DB Hits Slowing Performance
Solution: Leveraged Redis (Stash) to cache frequent API responses like `/tasks`, reducing latency significantly.

Challenge: Managing Role-Specific Access Dynamically
Solution: Created centralized `authorizeRoles()` middleware to handle route-level RBAC enforcement without hardcoding in controllers.

---

##  Demo Video

🎥 **[Watch Demo Video](https://drive.google.com/file/d/1AmeOEKPsNv9XG8-oIDwXHuGa3dEZRqfJ/view?usp=sharing)**


---

## 🌐 Live Deployment

🖥️ **Frontend + Backend Live URL**:  
🔗 [https://task-manager-ehbh.onrender.com](https://task-manager-ehbh.onrender.com)

---

## 🖼️ Screenshots

 **[View Screenshot Gallery on Google Drive](https://drive.google.com/drive/folders/1UJihmtl9e0MGBjXmw7NTMsSJilCv1-10?usp=sharing)**

###  Preview Highlights:

- 🔐 Login & Role-Specific Dashboards
- 📝 Task Assignment and Editing
- 💬 Real-time Comments via Socket.IO
- ⚙️ Redis Caching in Action
- 🔔 Live Notification Popups
- 👥 Assignee List (only for Admin/PM)
- 🚫 Permission Denied Alerts for restricted users

---

##  Repository

GitHub Repo: [https://github.com/Siraj004/Task_Manager]
---

##  Feedback & Contact

For feedback or contributions, feel free to open issues or reach out via (sirajudeenghousebasha@gmail.com)


