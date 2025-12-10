# ProManage - Collaborative Project Management Tool 🚀

ProManage is a full-stack project management application built to help teams organize projects, assign tasks, and track progress efficiently. It features real-time notifications, team collaboration, and a modern, responsive user interface.

## 🌟 Key Features

### 🔐 Authentication & Security
- **Secure Login/Register**: JWT-based authentication with password encryption (bcrypt).
- **Profile Management**: View user details and logout securely.
- **Password Visibility**: Toggle to show/hide password during input.

### 📁 Project Management
- **Dashboard**: Overview of all active projects with status and deadlines.
- **CRUD Operations**: Create, Read, Update, and Delete projects.
- **Search**: Real-time filtering of projects by title or description.

### ✅ Task Tracking
- **Task Assignment**: Assign tasks to team members by **Username** or **Email**.
- **Status Control**: Mark tasks as Pending or Completed with visual indicators.
- **Deadlines**: "Days Left" indicators (e.g., "2 days left", "Overdue").
- **Details View**: Click any task to see full description, creator, and admin controls.

### 👥 Collaboration
- **Team Management**: Invite members to projects via username and email.
- **Comments**: Discuss tasks with team members in real-time.
- **Notifications**:
  - Get notified when added to a project (INVITE).
  - Get notified when assigned a task (ASSIGNMENT).
  - Get notified of new comments (COMMENT).
  - **Smart Navigation**: Clicking a notification takes you directly to the relevant Project or Task.

### 🎨 UI/UX
- **Responsive Design**: Fully mobile-responsive sidebar and layout.
- **Modern Interface**: Clean, card-based layout using **Tailwind CSS**.
- **Interactive Elements**: Hover effects, modals, and smooth transitions.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Cloud).
- **Authentication**: JSON Web Tokens (JWT).

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js installed.
- MongoDB Atlas connection string.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Project-management
```

### 2. Backend Setup
Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm run dev
```
*Server runs on http://localhost:5000*

### 3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies:
```bash
cd client
npm install
```

Start the React development server:
```bash
npm run dev
```
*Client runs on http://localhost:5173*

---

## 📸 Screenshots

*(Add screenshots of your Dashboard, Project Details, and Task Modal here)*

---

## 👨‍💻 Developed By

Chandan Patidar Built with ❤️ for efficient teamwork.
