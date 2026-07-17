# Smart Routine Management & Analysis

An intelligent, enterprise-grade academic scheduling platform designed to automate university timetable generation and provide AI-powered diagnostic audits.

- **Frontend Application:** https://smart-routine-management.vercel.app/
- **Backend Production API:** https://smart-routine-management-backend.onrender.com

The application features a **deterministic constraint-based programmatic backtracking scheduler** for generating routines, paired with a robust **Gemini AI Auditing and Analysis Engine** to evaluate schedule health, room underutilization, teacher workloads, and general scheduling bottlenecks.

---

## Quick Start & Setup

### Prerequisites

- **Node.js** v18+ with npm
- **PostgreSQL** (cloud or local) OR SQLite (auto-fallback)
- **Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikeys))

### Installation

#### 1. Clone & Setup Project

```bash
git clone <repository-url>
cd smart-routine-management-analysis
npm install
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### 4. Environment Configuration

Create a `.env` file in the **backend** directory:

```env
# Database Configuration (Optional - defaults to SQLite if not set)
DB_HOST=your-postgres-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=routine_management_db
DB_DIALECT=postgres

# AI Integration (REQUIRED for AI Analysis features)
GEMINI_API_KEY=your-gemini-api-key

# Authentication
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
PORT=5000
```

#### 5. Start the Application

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Application:**

```bash
cd frontend
npm run dev
```

The application will be available locally at `http://localhost:5173` (Vite dev server).

### Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## Key Technical Stack

### Backend Services

- **Runtime Environment:** Node.js with TypeScript
- **Web Framework:** Express.js
- **Database Layer / ORM:** Sequelize ORM (Interfacing with cloud relational PostgreSQL databases with an automated SQLite fallback mechanism)
- **AI Integration:** `@google/genai` (Official modern Google GenAI SDK powered by `'gemini-3.1-flash-lite',gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.5-flash`)
- **API Security:** `express-rate-limit` (Intelligent IP-based request throttling) and JWT-based authentication
- **Module & Runtime Compilation:** Native ES Modules (ESM) powered by the `tsx` compilation runner and decoupled Bundler-style module resolution paths.

### Frontend Application

- **UI Framework:** React with TypeScript (powered by Vite)
- **Styling Architecture:** Tailwind CSS (utility-first, responsive grid mechanics)
- **Animation Framework:** `motion` (smooth micro-interactions, tab transitions, and real-time state alerts)
- **Icon Suite:** `lucide-react`
- **Format Document** `prettier`
- **Data Visualizations:** Custom CSS grids and dynamic dashboard widgets

---

## Design Theme & Color Palette

The platform is meticulously styled using a highly polished, professional design language that reflects modern, institutional enterprise systems. It rejects generic templates to deliver a cohesive, readable, and elegant interface.

### Theme: Classic Oxford Slate & Sky Accent

The application incorporates a high-contrast light theme built upon soft, eye-safe slate backgrounds, combined with deep navy brand blocks and sharp, modern sky-blue interactive elements.

### Core Color Palette

| Visual Element        | Color Hex / Tailwind Class         | Intended Use Case & Experience                                                                      |
| :-------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Deep Oxford Navy**  | `#2C4A6F`                          | Master administrative headers, primary buttons, and submit buttons. Represents trust and authority. |
| **Dark Navy Hover**   | `#1B324F`                          | Hover and focus state transitions for buttons to denote tactile clickability.                       |
| **Fluid Slate BG**    | `#F3F7FA`                          | Primary page backgrounds, container wrappers, and login screens to minimize visual fatigue.         |
| **Terminal Charcoal** | `bg-gray-50` / `text-gray-800`     | Table grids, active workbenches, and standard administrative list elements.                         |
| **Sky Highlighting**  | `bg-sky-50` / `text-sky-700`       | Dynamic navigation alerts, selected sidebar items, and diagnostic panel outlines.                   |
| **Success Emerald**   | `bg-green-50` / `text-emerald-800` | Safe constraint confirmations, successful schedule generation alerts, and stable workload metrics.  |
| **Caution Amber/Red** | `bg-red-50` / `text-red-800`       | Hard clash warnings, overloaded faculty flags, and system-wide diagnostic errors.                   |

### Typography Guidelines

- **Primary Interface:** **Inter** (sans-serif) for high legibility, professional line ratios, and comfortable numerical viewing inside complex schedule cards.
- **Accents & Code:** **JetBrains Mono** / **SFMono** for identifiers, JWT terminal states, and database logs.

---

## Project Structure

```
├── .vite
│   └── deps
│       ├── _metadata.json
│       └── package.json
├── backend
│   ├── config
│   │   └── db.ts
│   ├── controllers
│   │   ├── AiAnalysisController.ts
│   │   ├── AuthController.ts
│   │   ├── BatchController.ts
│   │   ├── CourseController.ts
│   │   ├── RoomController.ts
│   │   ├── RoutineController.ts
│   │   └── TeacherController.ts
│   ├── middleware
│   │   └── auth.ts
│   ├── models
│   │   ├── Admin.ts
│   │   ├── Batch.ts
│   │   ├── Course.ts
│   │   ├── Index.ts
│   │   ├── Room.ts
│   │   ├── Routine.ts
│   │   └── Teacher.ts
│   ├── routes
│   │   ├── aiRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── batchRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── index.ts
│   │   ├── roomRoutes.ts
│   │   ├── routineRoutes.ts
│   │   └── teacherRoutes.ts
│   ├── services
│   │   └── scheduler.ts
│   ├── utils
│   │   └── formatter.ts
│   ├── .gitignore
│   ├── .gitkeep
│   ├── app.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── server.ts
│   └── tsconfig.json
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── AiAnalysisTab.tsx
│   │   │   ├── BatchesTab.tsx
│   │   │   ├── CoursesTab.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── ReportsTab.tsx
│   │   │   ├── RoomsTab.tsx
│   │   │   ├── RoutineGeneratorTab.tsx
│   │   │   ├── RoutineViewerTab.tsx
│   │   │   └── TeachersTab.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── .gitignore
│   ├── .gitkeep
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .gitignore
├── README.md
├── package-lock.json
└── package.json
```

---

## Key Features Overview

### 1. Data Management

- Manage Teachers (faculty with ID, name, department)
- Manage Rooms (classrooms & laboratories with capacity)
- Manage Batches (student groups with section info)
- Manage Courses (theory & lab courses with prerequisites)

### 2. Intelligent Routine Generation

- Backtracking constraint solver with automatic schedule creation
- Conflict detection and resolution
- Handles complex multi-constraint scenarios
- Generates optimized schedules in seconds

### 3. Routine Visualization

- Interactive timetable matrix view
- Multi-filter system (by batch, teacher, day)
- Print-friendly layout option
- Export schedule as JSON

### 4. AI-Powered Analysis

- Gemini AI schedule audit engine
- Detailed workload analysis (teacher hours, room utilization)
- Problem identification with specific metrics
- Concrete optimization recommendations
- Efficiency scoring (0-100 scale)

### 5. Reporting & Export

- Generate comprehensive reports
- Export data in multiple formats
- Visual analytics and statistics

---

## How It Works - System Architecture

### Constraint-Based Scheduling Algorithm

The system uses a **Backtracking Constraint Satisfaction Problem (CSP)** solver:

```
1. LOAD REQUIREMENTS
   ├─ Parse all courses, teachers, batches, rooms
   ├─ Validate prerequisites (room type, capacity, teacher assignment)
   └─ Pre-flight checks (feasibility assessment)

2. PREPARE ITEMS TO SCHEDULE
   ├─ Theory courses → 2 sessions (1 slot each)
   ├─ Lab courses → 1 session (2 consecutive slots)
   └─ Sort by difficulty (labs first, larger batches first)

3. BACKTRACKING SEARCH
   ├─ For each course/session:
   │  ├─ Try each day (sorted by load)
   │  ├─ Try each time slot (sorted by availability)
   │  └─ Try each compatible room
   │
   ├─ Check 4 hard constraints:
   │  ├─ Teacher availability (no overlaps)
   │  ├─ Room availability (no overlaps)
   │  ├─ Batch availability (no overlaps)
   │  └─ Room type match (Lab→Lab, Theory→Classroom)
   │
   └─ Backtrack if any constraint fails

4. OPTIMIZATION HEURISTICS
   ├─ Day-load balancing (spread classes evenly)
   ├─ Theory no-adjacency rule (different days/non-adjacent)
   └─ Room capacity matching (fit to optimal size)

5. PERSIST SOLUTION
   └─ Save to database once all constraints satisfied
```

### Constraint Connections & Dependencies

```
ROUTINE (Hub Entity)
├── courseId (FK) ─────► COURSE ─────► TEACHER (FK)
│                               │
│                               └────► BATCH (FK)
│
├── teacherId (FK) ─────► TEACHER (availability check)
├── roomNumber (FK) ─────► ROOM (capacity & type check)
└── batchId (FK) ────────► BATCH (student count)

HARD CONSTRAINTS:
1. Teacher Constraint: ∀ teacher T, day D, slot S → max 1 class
2. Room Constraint: ∀ room R, day D, slot S → max 1 class
3. Batch Constraint: ∀ batch B, day D, slot S → max 1 class
4. Room Type: Theory courses → Classroom; Lab courses → Laboratory
5. Room Capacity: room.capacity ≥ batch.studentCount
6. Lab Slots: Lab requires (slot, slot+1) consecutive slots

SOFT CONSTRAINTS (for optimization):
1. Theory Distribution: No same course on same day
2. Theory Adjacency: No adjacent-day scheduling for same course
3. Load Balancing: Even distribution across days and slots
```

---

## Architectural Core & Runtime Design

The application adheres strictly to professional Enterprise MVC (Model-View-Controller) decoupling rules and modern asynchronous module specifications to maintain performance and maintainability:

- **Native ES Modules (ESM) & Bundler Linkage:** The server runtime operates entirely inside modern native ES Modules (`"type": "module"`). Utilizing TypeScript's `"moduleResolution": "Bundler"`, the ecosystem permits clean, future-proof, extensionless imports (`import from './app'`) while avoiding the compilation friction of explicit file extensions.
- **Separation of Concerns (MVC):** Traffic controllers are decoupled from routing mechanics. Routes file mappings are treated strictly as ingress controllers, while explicit operational business rules (e.g., identity verification checks, system status probes) reside within structured Controllers (`AuthController`).
- **Asynchronous Lifecycles (The Bootstrap Flow):** Rather than letting modules block the standard file execution graph, initialization tasks are contained within a centralized asynchronous `bootstrap()` lifecycle. This orchestrates synchronous component mapping before initiating live network socket listeners.

---

## Database Schema & Entity Relationships

The relational architecture is optimized for relational integrity to eliminate schedule data anomalies. The core schema centers on the **Routine** entity acting as a transactional hub connecting independent institutional dimensions:

- **Routine Hub Architecture:** The `Routine` entity serves as a junction record mapping relational foreign constraints across `Course` (via courseId), `Teacher` (via teacherId), `Room` (via roomNumber), and `Batch` (via batchId).
- **Dimensional Associations:**
  - **Teacher & Course:** Maintain structural relationships mapping to academic workloads (`hasMany` Courses / `belongsTo` Teacher).
  - **Batch & Course:** Associate distinct student groupings with their required syllabus components (`hasMany` Courses / `belongsTo` Batch).
  - **Eager Loading Optimization:** The operational data flow is optimized for nested Sequelize includes, permitting the Gemini AI Engine to evaluate comprehensive data payloads including structural metadata components (`room.capacity`, `course.courseType`, `teacher.name`, etc.) seamlessly without performance overhead.

---

## Database Architecture, Security & Optimization

The platform utilizes a highly reliable, cloud-ready database layer engineered with Sequelize ORM. It transitions away from standard local storage patterns to support robust, production-grade cloud environments like Aiven PostgreSQL, while maintaining full developer accessibility via localized database fallback engines.

### Key Security & Performance Architecture Enhancements

- **Mitigation of Command Injection (Zero `execSync` Execution):** The core connection layer explicitly eliminates shell execution subprocesses (such as `child_process.execSync`). By checking and validating parameters programmatically rather than passing raw configuration strings through shell tasks, the system is immune to environment-variable injection attacks.
- **Encrypted Transport Layer Security (Strict SSL Enforcement):** Connections routed over the public internet to cloud infrastructures employ strict SSL handshaking configurations (`require: true` and `rejectUnauthorized: true`). This shields all transaction streams from data snooping and Man-in-the-Middle (MITM) attacks.
- **Native Engine Handshakes:** Connection health checks discard slow, external networking tools and instead rely on native database transport engines through Sequelize’s specialized `instance.authenticate()` protocols.
- **Automatic Resiliency & Multi-Environment Fallback:** The backend implements an automated database routing fallback. If production configurations (`DB_HOST`, `DB_USER`, `DB_PASSWORD`) are absent or unreachable, the application automatically mounts an integrated local SQLite architecture (`./database.sqlite`) to guarantee an offline-capable, ready-to-go experience for testing and grading environments.
- **Self-Bootstrapping Administrator Seed:** During the startup sequence, the persistence layer checks user tables. If the environment is completely fresh or unseeded, the system automatically builds an administrative account with hashed and salted credentials (`admin123` via `bcryptjs`) to eliminate tedious structural migration steps.

---

## AI Diagnosis & Audit Infrastructure

The analytics engine uses the modern `@google/genai` SDK to execute programmatic, contextual evaluations of generated routines:

- **Token Optimization Pipeline:** Routine structures are dynamically serialized, filtering out unneeded structural query metadata down to strict textual JSON properties to operate cleanly within strict LLM token guidelines.
- **Zero-Config Context Initialization:** The analytical middleware securely initializes directly via standard environment configurations (`GEMINI_API_KEY`), allowing decoupled operational separation between AI API requests and database management transactions.
- **Intelligent Telemetry Processing:** The framework utilizes the high-throughput `gemini-2.5-flash` model instance to instantly interpret schedule structural configurations, highlighting edge cases such as teacher over-allocations, sequential slot burnouts, or space-to-student capacity inefficiencies.

---

## Interface Tabs Explained

### 1. Dashboard Tab

- Overview of system status
- Quick statistics (total teachers, rooms, batches, courses)
- Recent schedule generation history
- System health indicators

### 2. Teachers Tab

- View/add/edit/delete teacher profiles
- Assign courses to teachers
- Track teacher workload
- Search and filter by department/name

### 3. Rooms Tab

- Manage classrooms and laboratory rooms
- Set room capacity and type
- Track room utilization
- View room schedules

### 4. Batches Tab

- Manage student batches (cohorts)
- Set batch number, section, and student count
- Link courses to batches
- View batch schedules

### 5. Courses Tab

- Create theory and laboratory courses
- Assign teachers to courses
- Link courses to batches
- Set course code and type

### 6. Routine Generator Tab

- Trigger automated schedule generation
- View generation progress and status
- See conflict reports if generation fails
- Configure scheduling preferences

### 7. Routine Viewer Tab

- View generated timetable in interactive matrix
- **Timetable Matrix Features:**
  - Rows: Academic days (Sun-Thu)
  - Columns: Time slots (8 slots/day)
  - **Fullscreen mode** for better visibility
  - Filter by batch, teacher, or day
  - Color coding: Sky blue (lectures), Amber (lab continuation)
  - Cell info: Course code, type, room, teacher, batch
- **Print-friendly view:** Compact table format for exporting to PDF
- **Export JSON:** Download raw schedule data

### 8. AI Analysis Tab

- Run comprehensive Gemini AI audit
- **Analysis Components:**
  - **Executive Summary:** Overall schedule health with efficiency score (0-100)
  - **Actionable Bulletins:** 5-7 specific optimization recommendations
  - **Teacher Workload Assessor:** Detailed breakdown of each teacher's weekly load, daily distribution, and overload flags
  - **Room Utilization Assessor:** Room-by-room efficiency analysis with capacity match percentages
  - **Comprehensive Report:** Includes:
    - Teacher workload table with daily metrics
    - Room utilization table with % occupancy
    - Batch scheduling analysis with fragmentation detection
    - Problem severity assessment
    - Optimization roadmap with concrete actions
    - Resource efficiency KPIs

### 9. Reports Tab

- Generate downloadable reports
- Custom report creation
- Data export options
- Schedule statistics

---

## AI Analysis Deep Dive

### What Gets Analyzed?

The **Gemini AI Auditing Engine** evaluates:

1. **Teacher Workload Metrics**
   - Total weekly slots per teacher
   - Daily distribution and load balancing
   - Course variety and specialization
   - Overload detection (>8 slots/week or >3 slots/day)
   - Consecutive class burnout risks

2. **Room Utilization Efficiency**
   - % of available slots actually used
   - Capacity matching (room size vs. actual enrollment)
   - Capacity wastage % (unused seats)
   - Room type appropriateness (Lab vs. Classroom)
   - Underutilization warnings (<30% usage)

3. **Batch Scheduling Quality**
   - Student class fragmentation analysis
   - Time gaps between classes (for exam study time)
   - Balanced daily load distribution
   - Course distribution across week

4. **System-Wide Problems Identified**
   - Hard conflicts (constraint violations)
   - Soft conflicts (suboptimal scheduling)
   - Bottleneck rooms or time slots
   - Teacher overload situations
   - Capacity mismatch scenarios

5. **Efficiency Scoring Factors**
   - Teacher load balance (40%)
   - Room utilization rate (30%)
   - Batch schedule quality (20%)
   - Constraint satisfaction (10%)
