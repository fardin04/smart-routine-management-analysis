# Smart Routine Management & Analysis

An intelligent, enterprise-grade academic scheduling platform designed to automate university timetable generation and provide AI-powered diagnostic audits.

The application features a **deterministic constraint-based programmatic backtracking scheduler** for generating routines, paired with a robust **Gemini AI Auditing and Analysis Engine** to evaluate schedule health, room underutilization, teacher workloads, and general scheduling bottlenecks.

---

##  Key Technical Stack

### Backend Services
- **Runtime Environment:** Node.js with TypeScript
- **Web Framework:** Express.js 
- **Database Layer / ORM:** Sequelize ORM (Interfacing with structured relational MySQL databases)
- **AI Integration:** `@google/genai` (Official modern Google GenAI SDK powered by `models/gemini-2.5-flash`)
- **API Security:** `express-rate-limit` (Intelligent IP-based request throttling) and JWT-based authentication

### Frontend Application
- **UI Framework:** React with TypeScript (powered by Vite)
- **Styling Architecture:** Tailwind CSS (utility-first, responsive grid mechanics)
- **Animation Framework:** `motion` (smooth micro-interactions, tab transitions, and real-time state alerts)
- **Icon Suite:** `lucide-react`
- **Data Visualizations:** Custom CSS grids and dynamic dashboard widgets

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