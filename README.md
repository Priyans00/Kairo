# KairoMed

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

* [About the Solution](#about-the-solution)
* [Key Features](#key-features)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Demo](#demo)
* [Contributing](#contributing)
* [License](#license)

---

## About the Solution

Managing medication schedules for yourself and loved ones—children, elders, or family members—can be overwhelming. **KairoMed** centralizes this process in one intuitive interface, allowing you to:

* **Track and organize** multiple medication regimens in a unified dashboard
* **Receive smart reminders** for each dose and time
* **Lookup detailed drug information** instantly
* **Discover alternative options** based on active ingredients

This integrated approach ensures better adherence, reduces human error, and gives peace of mind when caring for family members with diverse medication needs.

---

## Key Features

| Feature                     | Benefit                                                   |
| --------------------------- | --------------------------------------------------------- |
| Medication Scheduling       | Add, view, and edit schedules for multiple users          |
| Medication Info Lookup      | Fuzzy search of 11,000+ medicines with AI fallback        |
| Alternative Medicine Finder | Suggests drugs sharing active ingredients                 |
| Secure Data Storage         | Supabase Postgres backend with robust search capabilities |
| Responsive UI               | Smooth, minimal interface built with Next.js              |

---

## Architecture

```
┌──────────┐      HTTPS       ┌─────────────┐      SQL/API       ┌──────────────┐
│  Next.js │ ──────────────▶ │  FastAPI    │ ────────────────▶  │  Supabase    │
│ Frontend │                  │  Backend    │                    │  Postgres    │
└──────────┘                  └─────────────┘                    └──────────────┘
```

---

## Tech Stack

* **Frontend**: Next.js, React, Tailwind CSS
* **Backend**: FastAPI, Pydantic, Google Generative AI (Gemini)
* **Database**: Supabase Postgres with `pg_trgm` extension
* **Deployment**: Vercel (frontend), Render (backend)

---

## Getting Started

### Prerequisites

* Node.js v18+ & npm
* Python 3.11+ & virtualenv
* Supabase project with `medicine_info` table and `search_medicine_trgm` function

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/Priyans00/KairoMed.git
   cd KairoMed
   ```
2. Setup Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Setup Backend:

   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

### Environment Variables

Create `.env` in `backend/`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<your-gemini-key>
```

---

## Demo

Live at [https://kairomed.vercel.app](https://kairomed.vercel.app)

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/...`)
3. Commit (`git commit -m "feat: ..."`)
4. Push & open PR

---

## License

MIT © 2025 Priyans
