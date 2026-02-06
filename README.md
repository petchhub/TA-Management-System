# TA Management System

A comprehensive web application for managing Teaching Assistant (TA) workflows, recruitment, and payroll in an academic setting. This system facilitates interaction between Students, Professors, Finance staff, and Administrators to streamline the TA management process.

---

## 🌟 Key Features

### 🌍 Public Access (Guest Users)
- **Position Search**: Browse open TA positions without logging in.
- **Course Details**: View detailed information about upcoming course requirements and schedules.
- **Easy Entry**: One-click navigation to login for students ready to apply.

### 🎓 Student Module
- **TA Recruitment**: Search and filter open TA positions by program and schedule.
- **Application Tracking**: Manage and track application status (Pending, Approved, Rejected).
- **Discord Integration**: Join course-specific Discord channels automatically upon approval.
- **Work Hours**: Log and track work hours via a personalized calendar or list view.
- **Profile Management**: Maintain academic records and contact information.

### 👨‍🏫 Professor Module
- **Course Definition**: Set up course details, requirements, and TA quotas.
- **Recruitment Management**: Review student applications and approve/reject candidates.
- **Team Oversight**: Monitor approved TAs and verify their logged work hours.
- **Communication**: Automated Discord channel creation for course teams.

### 💰 Finance Module
- **Dashboard**: High-level overview of TA hiring status and budget utilization.
- **Payroll Processing**: Export formatted XLS reports with localized Thai support.
- **Verification**: Generate attendance and signature sheets for auditing.
- **System Config**: Manage active semesters and academic terms.

### 🛡️ Admin & Security
- **RBAC**: Strict role-based access control for all system modules.
- **Secure Auth**: Google OAuth2 integration with session-based JWT authentication.

---

## 🛠 Tech Stack

### Frontend
- **React 18** (TypeScript, Vite)
- **Styling**: TailwindCSS & Vanilla CSS
- **UI Libraries**: Radix UI, Shadcn/UI, Lucide React
- **Notifications**: Sonner (Toasts)

### Backend
- **Go** (v1.24+)
- **API Framework**: Gin Gonic
- **Database**: PostgreSQL (sqlx)
- **Real-time**: Discord Integration (DiscordGo)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Go (v1.24+)
- PostgreSQL instance

### Installation & Execution

#### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Configure your database and OAuth credentials in .env
go mod download
go run ./cmd/main.go
```
*Runs on `http://localhost:8084`*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

#### 3. Discord Bot Setup
```bash
cd discord-bot-server
cp .env.example .env
# Configure BOT_TOKEN and GUILD_ID in .env
go mod download
go run ./main.go
```
*Runs on `http://localhost:8081`*

---

## 📱 Mobile Responsiveness
The system implements a tiered responsive strategy to ensure usability across all devices:

### 🎭 Role-Specific Support
- **Student, Guest, & Professor**: Full mobile support (`< 768px`) with overlay sidebars and touch-optimized layouts.
- **Finance**: Tablet-minimum approach (optimized for `≥ 768px`) to maintain the density required for financial data management.

### 🍱 Responsive Features
- **Adaptive Sidebars**: 
  - **Mobile**: Overlay menus with smooth backdrop animations.
  - **Tablet**: Space-saving collapsible navigation.
  - **Desktop**: Persistent fixed sidebars for power users.
- **Data Tables**: Smart column scaling (condensing dates, expanding names) to ensure critical information remains readable on small screens.
- **Interactive Calendar**: Mobile-specific detail popups for schedule activities.
- **Smart UI**: Context-aware visibility (hiding non-essential controls like Discord links on mobile) to reduce clutter.

---

## 📂 Project Structure

```text
TA-Management-System/
├── backend/                # Go API Server
│   ├── cmd/                # Entry points
│   ├── internal/           # Core logic & domain modules
│   └── ...
├── frontend/               # React Application
│   ├── src/
│   │   ├── pages/          # Role-specific views
│   │   ├── components/     # UI Design system
│   │   └── services/       # API integration
│   └── ...
├── discord-bot-server/     # Discord Integration Service
│   └── ...
└── ...
```

---

## 📝 Support
For technical issues or feature requests, please contact the development team or submit an issue in the repository.
