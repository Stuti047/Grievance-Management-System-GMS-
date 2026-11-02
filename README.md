# RCMS — Review & Complaint Management System
**Mathematics and Computing Department**  
**Madhav Institute of Technology & Science, Gwalior (M.P.), India**  
*(Deemed to be University • NAAC Accredited with A++ Grade)*

**Presented By:**  
- **Puneet Chaudhary** (Enrollment: BTMC25O1109)
- **Stuti Jain** (Enrollment: BTMC25O1139)

**Presented To:**  
- **Prof. Monika Dandotiya** (Faculty Advisor & Associate Professor)

---

## 🏛️ Project Overview

RCMS is a centralized, AI-powered Grievance Management System designed for the students, faculty, hostel wardens, and administrative authorities of MITS Gwalior. Built matching the official design template and aesthetic of the **MITS AMS Portal** (`https://ams.mitsgwalior.in/login`).

RCMS converts fragmented, opaque grievance handling (paper forms, WhatsApp messages, verbal complaints) into a transparent, auditable, and AI-assisted single source of truth.

---

## ✨ Key Features Implemented

### 1. 🔐 Authentic MITS Institutional Login & Google Auth
- **Design Template**: Replicates the layout, typography (Inter + Roboto Mono), colors, and emblem of the MITS AMS Portal (`ams.mitsgwalior.in/login`).
- **Google Sign-In**: Dedicated "Sign in with Google" button with institutional domain enforcement (`@mitsgwl.ac.in` and `@mitsgwalior.in`).
- **1-Click Quick Demo Evaluation**:
  - 🎓 **Student**: Puneet Chaudhary (`puneet.btmc25@mitsgwl.ac.in` / BTMC25O1109)
  - 🎓 **Student**: Stuti Jain (`stuti.btmc25@mitsgwl.ac.in` / BTMC25O1139)
  - 🛡️ **Hostel Authority**: Dr. S. K. Sharma (`warden.bh1@mitsgwalior.in` - Chief Warden BH-1)
  - 🛡️ **Academic HOD**: Prof. Monika Dandotiya (`hod.mac@mitsgwalior.in` - Math & Computing)
  - ⚙️ **Central Admin**: Chief Proctorial Board (`proctor.admin@mitsgwalior.in`)

### 2. 🤖 Interactive AI Chatbot Guide (Intake Assistant)
- **GPT-4o-mini Conversational Flow**: Assists students in turning ambiguous complaints into structured, actionable reports.
- **Structured JSON Output**: Automatically parses title, description, category, specific campus location, and priority.
- **1-Click Form Pre-fill**: Applies structured JSON data directly into the submission form.
- **Outage Fallback Simulation Mode**: Demonstrates the slide-specified graceful fallback when LLM endpoints are unavailable.

### 3. 🔍 Real-Time AI Duplicate Detection (Jaccard Token Similarity Engine)
- Mathematical Jaccard similarity index:
  $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
- Tokenizes title and description in real-time as the student types, filtering noise words and computing intersection against active category complaints.
- Prompts students to **Upvote Existing Tickets** instead of filing duplicates (e.g. *"Mess food poor dinner"* vs *"Mess dinner food bad"*).

### 4. 🔒 Zero-Knowledge Anonymous Reporting
- Cryptographic SHA-256 hashed identity shielding for sensitive complaints (anti-ragging, harassment, confidential reports).
- Generates a **12-character Secret Token** (e.g. `RCMS-SEC-710492`).
- **Anonymous Tracker**: Students can query live investigation progress using only their secret key without logging in.

### 5. 🔄 FSM Lifecycle & Cryptographic Audit Trail
- Finite State Machine transitions:
  `Submitted` ➔ `Under review` ➔ `Assigned` ➔ `In progress` ➔ `Resolved`
- **Tamper-Evident History Array**: Every transition logs actor, old status, new status, timestamp, and a SHA-256 hash.
- **Anti-Deletion Guarantee**: Attempting to delete a complaint triggers a `403 Forbidden` rejection. Institutional memory and evidence cannot be erased.

### 6. 💬 Dual-Layer Comments System
- **Public Communication**: Transparent messaging between students and grievance handlers.
- **Internal Authority Notes**: Marked with amber security badges, visible exclusively to authorities and administrators.

### 7. 📊 Actionable Analytics & Hotspots Dashboard
- Real-time SLA tracking (average turnaround time, % compliance).
- Campus & hostel hotspot detection (identifies repeat failures in BH-1, BH-2, SAC, or Academic Blocks).
- Printable audit and governance report.

---

## 🚀 Running the Full-Stack Project

### 1. Start PostgreSQL & Backend Server
```bash
# 1. Start PostgreSQL service
brew services start postgresql@16

# 2. Start the Backend API (Port 5000)
cd gms-backend
npm install
npm run prisma:migrate
npm start
```
The GMS Backend REST API will be active at `http://localhost:5000/api`.

### 2. Start Frontend Dev Server
In a separate terminal window:
```bash
cd rcms-frontend
npm install
npm run dev
```
The application will open at `http://localhost:5173/`.

### 3. Database Management & Inspection
To inspect the live PostgreSQL database via Prisma Studio:
```bash
cd gms-backend
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

