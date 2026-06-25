# Arcade Repair Log

A mobile-first web app for logging and tracking machine faults in arcade and leisure venues.

Built to replace the WhatsApp-and-paper workflow used between venue staff and external technicians.

---

## What it does

**Venue staff** log faults against machines — description, photos, priority level, whether it's a self-fix or needs a technician callout.

**Technicians** can track jobs across multiple venues, update status through the repair pipeline, and log parts information.

**Both sides** get a full timestamped history per machine — downtime tracked from fault logged to resolved, parts ETAs, delay flags, and resolution notes.

---

## The repair pipeline
Reported → Sega Job → In Progress → Parts Ordered → Parts Arrived → Installing → Resolved

↓

Parts Delayed (with reason + new ETA)

At each stage the app captures relevant info:
- **Parts Ordered** — part name, ETA, supplier reference
- **Parts Delayed** — reason for delay, new ETA
- **Installing** — estimated fix time
- **Resolved** — work done, actual time taken

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite (mobile-first PWA) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| File uploads | Multer (photos stored locally) |

---

## Running locally

**Requirements:** Node.js 18+, PostgreSQL

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/arcade-repair-log.git
cd arcade-repair-log

# 2. Install dependencies
npm install

# 3. Create the database
psql -U postgres -c "CREATE DATABASE arcade_repair;"

# 4. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your DB credentials

# 5. Run migrations
cd backend && node src/migrations/run.js

# 6. Start both servers
cd .. && npm run dev
```

Frontend runs on `http://localhost:3001`  
Backend runs on `http://localhost:3002`

**On mobile:** Connect your phone to the same WiFi, visit `http://YOUR_LOCAL_IP:3001`. Add to home screen for a native app experience.

---

## First time setup

Once running, use the app to:
1. Add your venues (Settings → Venues)
2. Add your machines per venue
3. Add your technicians/suppliers with their contact details

---

## Features

- Log faults with photos direct from phone camera
- Priority levels — low, medium, high, critical
- Self-fix vs technician callout separation
- Full parts tracking pipeline with delay flags and ETAs
- Downtime timer — tracks how long each machine has been down
- WhatsApp deep link — one tap to message the assigned technician with fault details pre-filled
- Notes thread per job
- Dashboard with open jobs, critical count, average resolution time

---

## Project structure
arcade-repair-log/

├── frontend/          # React + Vite PWA

│   └── src/

│       ├── pages/     # Dashboard, Jobs, New Job, Job Detail, Machines

│       ├── components/

│       └── services/  # API calls

├── backend/           # Node.js + Express

│   └── src/

│       ├── routes/    # jobs, machines, venues, technicians

│       ├── config/    # database connection

│       └── migrations/

└── package.json       # Monorepo root

