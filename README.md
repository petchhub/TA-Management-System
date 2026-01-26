# TA Management System

A comprehensive web application for managing Teaching Assistant (TA) workflows, recruitment, and payroll in an academic setting. This system facilitates interaction between Students, Professors, Finance staff, and Administrators to streamline the TA management process.

---

## 🌟 Key Features

### 🎓 Student Module
- **TA Recruitment**: Browse open TA positions for courses and submit applications.
- **Application Tracking**: View the status of your applications (Pending, Approved, etc.).
- **Work Management**: Log work hours and view responsibilities for accepted positions.
- **Course Details**: dedicated view for courses you support, including team info and schedule.

### 👨‍🏫 Professor Module
- **Course Management**: Set up course details, schedules, and TA requirements.
- **Recruitment**: Open TA positions, review applicants, and select candidates.
- **Team Oversight**: Monitor approved TAs, check work hours, and manage the team.

### 💰 Finance Module
- **Dashboard**: High-level overview of TA hiring status and budget utilization across all courses.
- **Disbursement List**: Export formatted payment reports (XLSX) with localized Thai month names for payroll processing.
- **Signature Sheets**: Generate attendance verification sheets for auditing.
- **Semester Management**: Configure active semesters/terms for the system.

### 🛡️ Admin & Security
- **Role-Based Access Control (RBAC)**: Strict access separation for Students, Professors, Finance, and Admins.
- **Authentication**: Secure login via Google OAuth2 with JWT session management.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) (TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: Radix UI, Shadcn/UI
- **Icons**: Lucide React
- **Routing**: React Router v6

### Backend
- **Language**: [Go](https://go.dev/) (v1.24+)
- **Web Framework**: [Gin Gonic](https://gin-gonic.com/)
- **Database**: PostgreSQL (using `sqlx` and `lib/pq`)
- **Authentication**: JWT & Google OAuth2
- **Logging**: Uber Zap

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Go (v1.24 or higher)
- PostgreSQL Database instance

### Installation & Run

#### 1. Backend Setup
Navigate to the backend directory and start the server:
```bash
cd backend
# Ensure your database credentials are configured in .env
go mod download
go run ./cmd/main.go
```
The backend server will start on `http://localhost:8084`.

#### 2. Frontend Setup
Navigate to the frontend directory and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The application will run on `http://localhost:3000`.

---

## 📂 Project Structure

```
TA-Management-System/
├── backend/                # Go Backend API
│   ├── cmd/                # Application entry point
│   ├── internal/           # Core application code
│   │   ├── modules/        # Feature modules (Student, Finance, etc.)
│   │   ├── middlewares/    # Auth & CORS middlewares
│   │   └── database/       # DB connection logic
│   └── ...
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (AuthContext)
│   │   ├── pages/          # Page views by Role (student, professor, finance)
│   │   ├── services/       # API integration services
│   │   └── utils/          # Helper functions
│   └── ...
└── ...
```

---

## 📝 Documentation

For more detailed information, specific documentation files are available:
- **[ROUTING_DOCUMENTATION.md](./ROUTING_DOCUMENTATION.md)**: Detailed breakdown of frontend and backend routes.
- **[FRONTEND_AUTH_FIXES.md](./FRONTEND_AUTH_FIXES.md)**: Log of authentication implementation details and fixes.
