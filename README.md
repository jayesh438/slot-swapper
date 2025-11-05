# SlotSwapper — ServiceHive SDE Challenge

Peer-to-peer time-slot scheduling app where users can mark calendar slots as **SWAPPABLE** and exchange with others.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React (Vite), React Router, Tailwind CSS
- **Bonus**: Docker & docker-compose for backend + MongoDB

## Features
- Sign up / Log in (JWT)
- CRUD for Events (title, startTime, endTime, status, owner)
- Marketplace of swappable slots (excluding current user)
- Swap Request flow (pending → accept / reject)
- State updates UI automatically after actions
- Protected routes on the frontend

## Project Structure
```
SlotSwapper/
├─ backend/
├─ frontend/
├─ docker-compose.yml     # Backend + MongoDB (frontend runs with `npm run dev` from its folder)
└─ README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Docker Desktop
- A running MongoDB (or use `docker-compose up` to start one quickly)

### 1) Backend
```bash
cd backend
cp .env.example .env        # edit values if needed
npm install
npm run dev                 # or: npm start
```
The API runs by default on **http://localhost:4000**.

**Environment variables (`.env`):**
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=supersecretchangeme
CORS_ORIGIN=http://localhost:5173
```

**API Endpoints**
| Method | Endpoint | Description |
|--|--|--|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/events | List my events |
| POST | /api/events | Create event |
| PUT | /api/events/:id | Update my event |
| DELETE | /api/events/:id | Delete my event |
| GET | /api/swappable-slots | List swappable slots from other users |
| POST | /api/swap-request | Create swap request (mySlotId, theirSlotId) |
| GET | /api/requests | Get incoming & outgoing requests |
| POST | /api/swap-response/:requestId | Respond to request ({ accepted: true/false }) |

### 2) Frontend
```bash
cd frontend
npm install
npm run dev    # opens http://localhost:5173
```

You can configure the API base URL in `frontend/src/lib/api.ts` (defaults to `http://localhost:4000`).

### 3) Docker (Optional: backend + Mongo)
```bash
# from project root
docker compose up -d
# backend API will be at http://localhost:4000
```

---

## Design Choices & Assumptions
- **Statuses**: `BUSY | SWAPPABLE | SWAP_PENDING`.
- When a swap request is created, both involved slots are set to `SWAP_PENDING` to prevent collisions.
- On accept: owners are swapped, both events set to `BUSY` and the request becomes `ACCEPTED`.
- On reject: both events revert to `SWAPPABLE`, request becomes `REJECTED`.
- Timestamps stored in ISO 8601 strings; backend uses Date objects.
- Minimal UI/UX for clarity and speed.

## Postman
A minimal Postman collection is included in `postman/SlotSwapper.postman_collection.json`.

## Deploy (quick pointers)
- **Frontend**: Vercel/Netlify (build command `npm run build`, output `dist`). Set env `VITE_API_BASE` to the backend URL.
- **Backend**: Render/Fly/Heroku/Docker; set `MONGO_URI` & `JWT_SECRET`.

## License
MIT
