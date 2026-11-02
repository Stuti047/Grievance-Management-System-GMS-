# Grievance Management System (GMS)
**Madhav Institute of Technology & Science, Gwalior (M.P.), India**  
*(Deemed to be University • NAAC Accredited with A++ Grade)*

**Department:** Mathematics and Computing  
**Project Authors:**  
- **Puneet Chaudhary** (Enrollment: BTMC25O1109)  
- **Stuti Jain** (Enrollment: BTMC25O1139)  

**Under the Guidance of:**  
- **Prof. Monika Dandotiya** (Faculty Advisor & Associate Professor, Mathematics and Computing)

**Repository:** [https://github.com/Stuti047/Grievance-Management-System-GMS-.git](https://github.com/Stuti047/Grievance-Management-System-GMS-.git)

---

## 🏛️ System Overview

The **Grievance Management System (GMS)** is a robust, full-stack institutional grievance redressal platform engineered for students, faculty, hostel wardens, and administrative authorities at MITS Gwalior.

All user-generated grievance records, status lifecycle histories, community discussions, and resolution feedbacks are persisted directly in a normalized **PostgreSQL** database managed via **Prisma ORM**, with server-side Role-Based Access Control (RBAC), bcrypt password hashing, and stateless JWT authentication.

---

## 🔑 Verified Demo & Evaluation Accounts

The development database is provisioned with verified demonstration accounts across all institutional roles:

| Role | Account Name | Official Email | Password | Access Scope |
|---|---|---|---|---|
| **Student (Required Demo)** | MITS Student Demo | `25mc1st139@mitsgwl.ac.in` | `S@just` | Submit grievances, track tickets, view community feed, upvote, comment, submit feedback |
| **Student** | Puneet Chaudhary | `puneet.btmc25@mitsgwl.ac.in` | `Password@123` | Student portal, submit issues, personal tickets |
| **Student** | Stuti Jain | `stuti.btmc25@mitsgwl.ac.in` | `Password@123` | Student portal, submit issues, personal tickets |
| **Authority** | Prof. Monika Dandotiya (HOD) | `hod.mac@mitsgwalior.in` | `Authority@123` | Departmental authority console, FSM status transitions, internal staff notes |
| **Authority** | Dr. S. K. Sharma (Chief Warden) | `warden.bh1@mitsgwalior.in` | `Authority@123` | Hostel administration console, field inspections, internal audit remarks |
| **Admin** | Prof. R. S. Jadon (Dean / Proctor) | `admin@mitsgwalior.in` | `Admin@123` | Full administrative console, authority directory management, moderation flags, system audits |

*Note: You can also click **"Create Account"** on the login page to register a new student account using your own institutional details.*

---

## ✨ Core Features & Technical Architecture

### 1. 🛡️ Dual-Option Authentication & Security
- **Option A (Sign In):** Authenticate with registered credentials, password toggle, quick demo prefill, and secure password reset flow.
- **Option B (Create Account):** Real-time client & server validation (name, institutional email, department, enrollment number, password confirmation), bcrypt 10-round hashing, and automatic session initialization upon registration.
- **Server-Side RBAC:** Enforces strict role boundaries for Student, Authority, and Admin on every API endpoint.
- **Zero Exposed Passwords:** Passwords hashed with bcrypt; JWT issued on HTTP Bearer Authorization headers.

### 2. 🏛️ MITS Responsible Authorities & Faculty Directory (34 Official Members)
- Integrates the 34 official MITS faculty authorities and their designated institutional responsibilities (e.g., Women Guidance Cell, Proctorial Board, TEQIP III, Exam Controller, Central Library, Innovation Cell, Hostel Administration).
- **Strict Privacy Protection:** Faculty email addresses are completely omitted from public/student-facing pages and public API responses.
- **Confidential Contact Numbers:** Phone numbers are strictly restricted to verified administrators and masked from general students.
- **Administrative Responsibility Management:** Authorized administrators can edit faculty names, designations, departments, assigned responsibilities, and reassign grievance categories directly through the directory console, with all changes logged in `audit_logs`.

### 3. 📋 Persistent Grievance Lifecycle Management
- **9 Institutional Categories:**
  1. Academic Issues (Routed to Dean Academics / Academic Development Cell)
  2. Examination and Results (Routed to Controller of Examination)
  3. Infrastructure and Maintenance (Routed to Campus Infrastructure Head)
  4. Hostel Facilities (Routed to Hostel Manager & Chief Wardens)
  5. Library Services (Routed to Central Library Chairman)
  6. IT and Technical Support (Routed to Central Computer Centre & IMS Head)
  7. Administrative Issues (Routed to Registrar Office & Administrative Officer)
  8. Faculty-Related Grievances (Routed to Chief Proctorial Board)
  9. Other Student Concerns (Routed to Women Guidance & Health Incharge)
- **FSM State Transitions:** `Submitted` ➔ `Under review` ➔ `Assigned` ➔ `In progress` ➔ `Resolved` ➔ `Closed` / `Reopened`.
- **Append-Only Status History:** Every transition records previous status, new status, updater ID, timestamp, and audit remarks.
- **Unique Upvotes:** Database-enforced `@@unique([grievance_id, user_id])` constraint prevents duplicate upvotes.
- **Dual-Layer Notes:** Public community comments vs. private authority internal notes (strictly hidden from students).
- **Resolution Feedback:** Students rate and confirm resolution (1–5 stars and comments), which automatically transitions the ticket to `Closed`.

### 4. 📊 Dataset Integration
- Includes a repeatable, non-destructive demo dataset with realistic grievance scenarios across all 9 categories.
- Dataset records are tagged with `is_demo: true` and `dataset_tag: 'mits_dataset_v1'`, keeping them cleanly distinguishable from genuine student complaints.
- Zero exposed personal emails in dataset records.

### 5. 🤖 Institutional AI Guide & Assistant
- **Rule-based & Knowledge-Base AI Intake:** Preserves offline and resilient operation without external third-party model breakages.
- Guides students in converting rough notes into formal grievances.
- Real-time Jaccard token similarity duplicate detection prevents duplicate submissions.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### 1. Clone & Configure Backend
```bash
# Clone the repository
git clone https://github.com/Stuti047/Grievance-Management-System-GMS-.git
cd Grievance-Management-System-GMS-

# Configure Backend
cd gms-backend
cp .env.example .env
npm install
```

Configure `gms-backend/.env`:
```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/gms_db?schema=public"
JWT_SECRET="mits_gms_secure_jwt_secret_2026"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 2. Run Database Migrations & Seed Data
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Seed institutional faculty authorities & realistic dataset
node src/scripts/seedAuthoritiesAndDataset.js

# Ensure required student demo account is provisioned
node src/scripts/seedStudentDemoAccount.js
```

### 3. Start the Backend API Server
```bash
npm run dev
# Server starts on http://localhost:5000/api
```

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd ..
npm install
npm run dev
# Application starts on http://localhost:5173
```

### 5. Build for Production
```bash
npm run build
# Production assets compiled to dist/
```

---

## 🔒 Security & Privacy Guarantees

1. **No Hardcoded Credentials in Git:** All secrets, database URLs, and JWT keys reside in `.env` files which are excluded by `.gitignore`.
2. **PostgreSQL Relational Integrity:** All data operations execute via Prisma prepared statements immune to SQL injection.
3. **Faculty Privacy:** No faculty Gmail or personal contact information is exposed in student UI or public API payloads.
4. **Audit Logging:** Administrative updates to faculty responsibilities or categories are stored with timestamps in `audit_logs`.
