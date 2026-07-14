# Smart Routine Management & Analysis

An intelligent, enterprise-grade academic scheduling platform designed to automate university timetable generation and provide AI-powered diagnostic audits.

The application features a **deterministic constraint-based programmatic backtracking scheduler** for generating routines, paired with a robust **Gemini AI Auditing and Analysis Engine** to evaluate schedule health, room underutilization, teacher workloads, and general scheduling bottlenecks.

---

##  Key Technical Stack

### Backend Services
- **Runtime Environment:** Node.js with TypeScript
- **Web Framework:** Express.js 
- **Database Layer / ORM:** Sequelize ORM (Interfacing with cloud relational PostgreSQL databases with an automated SQLite fallback mechanism)
- **AI Integration:** `@google/genai` (Official modern Google GenAI SDK powered by `models/gemini-2.5-flash`)
- **API Security:** `express-rate-limit` (Intelligent IP-based request throttling) and JWT-based authentication
- **Module & Runtime Compilation:** Native ES Modules (ESM) powered by the `tsx` compilation runner and decoupled Bundler-style module resolution paths.

### Frontend Application
- **UI Framework:** React with TypeScript (powered by Vite)
- **Styling Architecture:** Tailwind CSS (utility-first, responsive grid mechanics)
- **Animation Framework:** `motion` (smooth micro-interactions, tab transitions, and real-time state alerts)
- **Icon Suite:** `lucide-react`
- **Data Visualizations:** Custom CSS grids and dynamic dashboard widgets

---

## 🏗️ Architectural Core & Runtime Design

The application adheres strictly to professional Enterprise MVC (Model-View-Controller) decoupling rules and modern asynchronous module specifications to maintain performance and maintainability:

* **Native ES Modules (ESM) & Bundler Linkage:** The server runtime operates entirely inside modern native ES Modules (`"type": "module"`). Utilizing TypeScript's `"moduleResolution": "Bundler"`, the ecosystem permits clean, future-proof, extensionless imports (`import from './app'`) while avoiding the compilation friction of explicit file extensions.
* **Separation of Concerns (MVC):** Traffic controllers are decoupled from routing mechanics. Routes file mappings are treated strictly as ingress controllers, while explicit operational business rules (e.g., identity verification checks, system status probes) reside within structured Controllers (`AuthController`).
* **Asynchronous Lifecycles (The Bootstrap Flow):** Rather than letting modules block the standard file execution graph, initialization tasks are contained within a centralized asynchronous `bootstrap()` lifecycle. This orchestrates synchronous component mapping before initiating live network socket listeners.

---

## 📊 Database Schema & Entity Relationships

The relational architecture is optimized for relational integrity to eliminate schedule data anomalies. The core schema centers on the **Routine** entity acting as a transactional hub connecting independent institutional dimensions:

* **Routine Hub Architecture:** The `Routine` entity serves as a junction record mapping relational foreign constraints across `Course` (via courseId), `Teacher` (via teacherId), `Room` (via roomNumber), and `Batch` (via batchId).
* **Dimensional Associations:** * **Teacher & Course:** Maintain structural relationships mapping to academic workloads (`hasMany` Courses / `belongsTo` Teacher).
  * **Batch & Course:** Associate distinct student groupings with their required syllabus components (`hasMany` Courses / `belongsTo` Batch).
  * **Eager Loading Optimization:** The operational data flow is optimized for nested Sequelize includes, permitting the Gemini AI Engine to evaluate comprehensive data payloads including structural metadata components (`room.capacity`, `course.courseType`, `teacher.name`, etc.) seamlessly without performance overhead.

---

## 🛡️ Database Architecture, Security & Optimization

The platform utilizes a highly reliable, cloud-ready database layer engineered with Sequelize ORM. It transitions away from standard local storage patterns to support robust, production-grade cloud environments like Aiven PostgreSQL, while maintaining full developer accessibility via localized database fallback engines.

### Key Security & Performance Architecture Enhancements

* **Mitigation of Command Injection (Zero `execSync` Execution):** The core connection layer explicitly eliminates shell execution subprocesses (such as `child_process.execSync`). By checking and validating parameters programmatically rather than passing raw configuration strings through shell tasks, the system is immune to environment-variable injection attacks.
* **Encrypted Transport Layer Security (Strict SSL Enforcement):** Connections routed over the public internet to cloud infrastructures employ strict SSL handshaking configurations (`require: true` and `rejectUnauthorized: true`). This shields all transaction streams from data snooping and Man-in-the-Middle (MITM) attacks.
* **Native Engine Handshakes:** Connection health checks discard slow, external networking tools and instead rely on native database transport engines through Sequelize’s specialized `instance.authenticate()` protocols.
* **Automatic Resiliency & Multi-Environment Fallback:** The backend implements an automated database routing fallback. If production configurations (`DB_HOST`, `DB_USER`, `DB_PASSWORD`) are absent or unreachable, the application automatically mounts an integrated local SQLite architecture (`./database.sqlite`) to guarantee an offline-capable, ready-to-go experience for testing and grading environments.
* **Self-Bootstrapping Administrator Seed:** During the startup sequence, the persistence layer checks user tables. If the environment is completely fresh or unseeded, the system automatically builds an administrative account with hashed and salted credentials (`admin123` via `bcryptjs`) to eliminate tedious structural migration steps.

---

## 🤖 AI Diagnosis & Audit Infrastructure

The analytics engine uses the modern `@google/genai` SDK to execute programmatic, contextual evaluations of generated routines:

* **Token Optimization Pipeline:** Routine structures are dynamically serialized, filtering out unneeded structural query metadata down to strict textual JSON properties to operate cleanly within strict LLM token guidelines.
* **Zero-Config Context Initialization:** The analytical middleware securely initializes directly via standard environment configurations (`GEMINI_API_KEY`), allowing decoupled operational separation between AI API requests and database management transactions.
* **Intelligent Telemetry Processing:** The framework utilizes the high-throughput `gemini-2.5-flash` model instance to instantly interpret schedule structural configurations, highlighting edge cases such as teacher over-allocations, sequential slot burnouts, or space-to-student capacity inefficiencies.

---

##  Design Theme & Color Palette

The platform is meticulously styled using a highly polished, professional design language that reflects modern, institutional enterprise systems. It rejects generic templates to deliver a cohesive, readable, and elegant interface.

###  Theme: Classic Oxford Slate & Sky Accent
The application incorporates a high-contrast light theme built upon soft, eye-safe slate backgrounds, combined with deep navy brand blocks and sharp, modern sky-blue interactive elements.

###  Core Color Palette
| Visual Element | Color Hex / Tailwind Class | Intended Use Case & Experience |
| :--- | :--- | :--- |
| **Deep Oxford Navy** | `#2C4A6F` | Master administrative headers, primary buttons, and submit buttons. Represents trust and authority. |
| **Dark Navy Hover** | `#1B324F` | Hover and focus state transitions for buttons to denote tactile clickability. |
| **Fluid Slate BG** | `#F3F7FA` | Primary page backgrounds, container wrappers, and login screens to minimize visual fatigue. |
| **Terminal Charcoal** | `bg-gray-50` / `text-gray-800` | Table grids, active workbenches, and standard administrative list elements. |
| **Sky Highlighting** | `bg-sky-50` / `text-sky-700` | Dynamic navigation alerts, selected sidebar items, and diagnostic panel outlines. |
| **Success Emerald** | `bg-green-50` / `text-emerald-800` | Safe constraint confirmations, successful schedule generation alerts, and stable workload metrics. |
| **Caution Amber/Red**| `bg-red-50` / `text-red-800` | Hard clash warnings, overloaded faculty flags, and system-wide diagnostic errors. |

### ✍️ Typography Guidelines
- **Primary Interface:** **Inter** (sans-serif) for high legibility, professional line ratios, and comfortable numerical viewing inside complex schedule cards.
- **Accents & Code:** **JetBrains Mono** / **SFMono** for identifiers, JWT terminal states, and database logs.

---