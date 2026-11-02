# GMS Backend — Grievance Management System (MITS Gwalior)

Production-ready backend REST API and PostgreSQL database for the Grievance Management System (GMS) at Madhav Institute of Technology & Science (MITS), Gwalior.

Built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**, implementing strict role-based access control (Student, Authority, Admin), tamper-evident audit history, and zero-knowledge anonymous tracking.

---

## 1. System Architecture

```
gms-backend/
├── prisma/
│   ├── schema.prisma         # Normalized relational PostgreSQL schema (9 entities)
│   └── migrations/           # Versioned Prisma migration history
│       └── 20261102041127_init_gms_schema/
│           └── migration.sql
├── src/
│   ├── config/
│   │   ├── db.js             # PrismaClient singleton
│   │   └── jwt.js            # JWT signing & verification
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, me, quick-login
│   │   ├── user.controller.js       # Profiles, user listing, account status
│   │   ├── grievance.controller.js  # CRUD, FSM lifecycle, duplicate check, token tracking
│   │   ├── comment.controller.js    # Comments & confidential internal notes
│   │   ├── support.controller.js    # Upvote toggle (duplicate-safe)
│   │   ├── feedback.controller.js   # Student feedback & auto-close logic
│   │   ├── flag.controller.js       # Content flagging & admin resolution
│   │   ├── category.controller.js   # Institutional categories & SLA
│   │   ├── authority.controller.js  # Department authorities & officer accounts
│   │   └── analytics.controller.js  # Aggregated metrics, age buckets, SLA performance
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & RBAC authorization
│   │   ├── errorHandler.js   # Centralized error handler with Prisma code mapping
│   │   ├── rateLimiter.js    # Express rate limiters for auth & submissions
│   │   └── validate.js       # Zod request validator
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── grievance.routes.js
│   │   ├── category.routes.js
│   │   ├── authority.routes.js
│   │   ├── feedback.routes.js
│   │   ├── flag.routes.js
│   │   ├── analytics.routes.js
│   │   └── index.js
│   ├── utils/
│   │   ├── fsm.js            # Finite-State Machine transition validator
│   │   ├── token.js          # Sequential ticket & anonymous token generators
│   │   └── response.js       # Privacy-aware response formatters
│   ├── validators/           # Zod validation schemas
│   ├── scripts/
│   │   └── initSystem.js     # Seeds initial institutional taxonomy & accounts
│   └── server.js             # Express application entrypoint
├── .env.example
├── .gitignore
└── package.json
```

---

## 2. PostgreSQL Relational Database Schema

The database `gms_db` is normalized across 9 relational tables:

1. **`users`**:
   - `id` (Primary Key, cuid)
   - `name`, `email` (Unique, MITS domain validated), `password_hash` (bcrypt)
   - `role` (`student`, `authority`, `admin`)
   - `department`, `enrollment_no`, `hostel`, `room_no`, `avatar`
   - `status` (`active`, `warned`, `blocked`)
   - `created_at`, `updated_at`

2. **`authorities`**:
   - `id` (Primary Key, cuid)
   - `user_id` (Unique Foreign Key -> `users.id`, onDelete: Cascade)
   - `department` (e.g. "Hostel Administration", "Mathematics and Computing")
   - `designation`, `section` (`hostel`, `mess`, `college`)

3. **`categories`**:
   - `id` (Primary Key, cuid)
   - `name` (Unique)
   - `description`, `section`, `sla_hours` (default: 48)
   - `authority_id` (Foreign Key -> `authorities.id`, onDelete: SetNull)

4. **`grievances`**:
   - `id` (Primary Key, cuid)
   - `ticket_number` (Unique, e.g. `GRV-2026-00101`)
   - `title`, `description` (Text), `category_id` (Foreign Key)
   - `priority` (`Low`, `Medium`, `High`, `Urgent`)
   - `status` (`Submitted`, `Under review`, `Assigned`, `In progress`, `No Progress`, `Escalated`, `Resolved`, `Closed`, `Reopened`, `Rejected`)
   - `location`, `is_anonymous` (Boolean), `tracking_token` (Unique)
   - `sla_hours`, `evidence_urls` (Text Array)
   - `submitted_by` (Foreign Key -> `users.id`)
   - `assigned_authority_id` (Foreign Key -> `authorities.id`)
   - `resolved_at`, `is_deleted` (Boolean, default: false)
   - `created_at`, `updated_at`

5. **`status_history`** (Append-only audit trail):
   - `id` (Primary Key, cuid)
   - `grievance_id` (Foreign Key -> `grievances.id`, onDelete: Cascade)
   - `previous_status`, `new_status`
   - `updated_by` (Foreign Key -> `users.id`)
   - `remarks` (Text), `created_at`

6. **`comments`**:
   - `id` (Primary Key, cuid)
   - `grievance_id` (Foreign Key -> `grievances.id`, onDelete: Cascade)
   - `user_id` (Foreign Key -> `users.id`)
   - `comment_text` (Text)
   - `is_internal` (Boolean — only authorities & admin can see)
   - `is_anonymous` (Boolean — author identity masked for public)
   - `created_at`

7. **`upvotes`**:
   - `id` (Primary Key, cuid)
   - `grievance_id` (Foreign Key -> `grievances.id`, onDelete: Cascade)
   - `user_id` (Foreign Key -> `users.id`, onDelete: Cascade)
   - `created_at`
   - **`@@unique([grievance_id, user_id])`** (Prevents duplicate upvotes)

8. **`feedback`**:
   - `id` (Primary Key, cuid)
   - `grievance_id` (Unique Foreign Key -> `grievances.id`, onDelete: Cascade)
   - `user_id` (Foreign Key -> `users.id`)
   - `rating` (1-5), `resolved_ok` (Boolean), `feedback_text` (Text)
   - `created_at`

9. **`flags`**:
   - `id` (Primary Key, cuid)
   - `grievance_id` (Foreign Key -> `grievances.id`, onDelete: Cascade)
   - `reported_by` (Foreign Key -> `users.id`)
   - `reason` (Text), `status`, `resolved` (Boolean)
   - `created_at`
   - **`@@unique([grievance_id, reported_by])`**

---

## 3. Finite-State Machine (FSM) Lifecycle

The grievance resolution workflow strictly enforces the institutional protocol:

```
Submitted ───► Under review ───► Assigned ───► In progress ───► Resolved ───► Closed
    │               │                │              │                             ▲
    ▼               ▼                ▼              ├───► No Progress             │
 Rejected        Rejected         Rejected          │         │                   │
                                                    ├───► Escalated               │
                                                    │         │                   │
                                                    └─────────┴───────────────────┘
                                                              │
                                                              ▼
                                                           Reopened
```

- **Strict Transition Rules**: Skipping intermediate states returns `400 Bad Request`.
- **RBAC Guard**: Students cannot alter statuses (`403 Forbidden`). Authorities can only act on grievances assigned to their department.
- **Tamper-Evident History**: Every state transition creates an immutable row in `status_history`.

---

## 4. REST API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register student account with MITS email domain |
| POST | `/auth/login` | Public | Authenticate user & receive JWT token |
| GET | `/auth/me` | Authenticated | Fetch current user session profile |
| POST | `/auth/quick-login` | Public | 1-Click fast login for evaluation roles |

### User Management (`/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/profile` | Authenticated | Get current user profile with stats |
| PUT | `/users/profile` | Authenticated | Update user profile details |
| GET | `/users` | Admin only | List all registered users (filters: role, status, search) |
| PUT | `/users/:id/status`| Admin only | Update user account status (`active`, `warned`, `blocked`) |

### Grievances (`/grievances`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/grievances` | Authenticated | Submit new grievance (generates sequential ticket ID & token) |
| GET | `/grievances` | Public/Auth | List grievances (filters: category, status, section, search) |
| GET | `/grievances/mine` | Authenticated | Fetch grievances submitted by current student |
| GET | `/grievances/:id` | Public/Auth | Get grievance detail with history, comments & feedback |
| PUT | `/grievances/:id/status` | Auth/Admin | Advance status according to FSM rules |
| POST | `/grievances/:id/reopen` | Reporter/Admin | Reopen Closed grievance |
| DELETE | `/grievances/:id` | Admin only | Soft delete grievance (students get 403 Forbidden) |
| GET | `/grievances/track/:token` | Public | Zero-knowledge anonymous tracker by secret key |
| GET | `/grievances/check-duplicates` | Public | Similarity search for duplicate tickets |

### Community & Interactions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/grievances/:id/comments` | Authenticated | Post comment on grievance (supports anonymous student flag) |
| GET | `/grievances/:id/comments` | Public/Auth | Fetch comments (internal notes hidden from students) |
| POST | `/grievances/:id/internal-notes` | Auth/Admin | Add confidential authority investigation note |
| POST | `/grievances/:id/upvote` | Authenticated | Toggle support / upvote (duplicate-safe) |
| DELETE | `/grievances/:id/upvote` | Authenticated | Remove support / upvote |
| POST | `/grievances/:id/feedback` | Reporter only | Submit resolution rating; auto-closes ticket if resolved |
| POST | `/grievances/:id/flag` | Authenticated | Report inappropriate content for admin review |

### Administration & Taxonomy
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public | List institutional categories & SLA hours |
| POST | `/categories` | Admin only | Create new category with assigned authority |
| GET | `/authorities` | Public | List departments & authority officer profiles |
| POST | `/authorities` | Admin only | Create new authority account |
| GET | `/flags` | Admin only | List flagged complaints |
| PUT | `/flags/:id/resolve` | Admin only | Mark flag as resolved |
| GET | `/analytics/summary` | Public | Aggregated KPIs, status breakdown, SLA performance |
| GET | `/health` | Public | API liveness & timestamp check |

---

## 5. Local Setup Instructions

### Prerequisites
- **Node.js**: v18+ (verified on v24.21.0)
- **npm**: v9+ (verified on 11.19.0)
- **PostgreSQL**: v14+ (installed via Homebrew `postgresql@16`)

### Step 1: Install PostgreSQL (macOS)
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Step 2: Create the Database
```bash
/opt/homebrew/opt/postgresql@16/bin/createdb gms_db
```

### Step 3: Configure Environment Variables
Create a `.env` file inside `gms-backend/`:
```env
DATABASE_URL="postgresql://stutijain@localhost:5432/gms_db?schema=public"
JWT_SECRET="mits_gms_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### Step 4: Install Dependencies & Run Migrations
```bash
cd gms-backend
npm install
npx prisma migrate dev --name init_gms_schema
```

### Step 5: Initialize Institutional Taxonomy
Run the institutional setup script to configure official categories and accounts:
```bash
node src/scripts/initSystem.js
```

### Step 6: Start the Backend Server
```bash
npm start
# Server runs at http://localhost:5000
```

### Step 7: Start Frontend Server
In a separate terminal:
```bash
cd ..
npm run dev
# App runs at http://localhost:5173
```
