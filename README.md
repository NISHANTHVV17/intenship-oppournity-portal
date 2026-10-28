# Internship Opportunity Portal – Internship Listings and Applications

A full-stack web app where **students** browse and apply for internships and **admins** manage internships and applications.

- **Frontend:** React 18 (Vite), React Router v6, Bootstrap 5, Bootstrap Icons, Axios
- **Backend:** Node.js, Express, bcryptjs, jsonwebtoken, uuid, cors, dotenv
- **Database:** MongoDB Atlas (cloud) via Mongoose. Data is saved permanently. On the very first start, the sample data in `server/data/` is inserted automatically.

---

## 1. Prerequisites

- **Node.js v18 or newer** (download the LTS version from https://nodejs.org)
- **VS Code** (recommended)
- A **MongoDB Atlas** cluster (the free M0 tier is enough) and its connection string

Check your installation in a terminal:

```bash
node -v
npm -v
```

---

## 2. Project Structure

```
internship-portal/
├── client/                     React frontend (port 5173)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx            App entry (Router + providers)
│       ├── App.jsx             All routes
│       ├── index.css           Theme and custom styles
│       ├── services/api.js     Axios instance (API base URL + JWT)
│       ├── context/
│       │   ├── AuthContext.jsx Login / register / logout state
│       │   └── ToastContext.jsx Toast notifications
│       ├── utils/helpers.js    Constants + date/stipend helpers
│       ├── components/         Navbar, Footer, InternshipCard, StatusBadge,
│       │                       ProtectedRoute, AdminRoute, LoadingSpinner,
│       │                       Toast, Modal, ConfirmModal, EmptyState, InternshipForm
│       └── pages/
│           ├── Home.jsx, Login.jsx, Register.jsx, Internships.jsx,
│           │   InternshipDetails.jsx, NotFound.jsx
│           ├── student/        StudentDashboard, MyApplications, Profile
│           └── admin/          AdminDashboard, AddInternship, EditInternship,
│                               ManageApplications
├── server/                     Express backend (port 5000)
│   ├── server.js               App entry (connects to MongoDB, then starts)
│   ├── seed.js                 Inserts / resets the sample data
│   ├── .env.example            Copy to .env
│   ├── package.json
│   ├── config/db.js            MongoDB Atlas connection
│   ├── models/                 Mongoose models: User, Internship, Application
│   ├── data/                   Sample data: users.js, internships.js, applications.js
│   ├── middleware/             auth.js, errorHandler.js
│   ├── controllers/            auth, internship, application, user, stats
│   ├── routes/                 one route file per resource
│   └── utils/helpers.js        Date, URL and validation helpers
├── .gitignore
└── README.md
```

---

## 3. Running the Project in VS Code (two terminals)

Open the `internship-portal` folder in VS Code, then open a terminal with **Terminal → New Terminal**.

### Terminal 1: Backend

```bash
cd server
npm install
```

Create the environment file (only needed once):

```bash
# Windows (PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `server/.env` and set `MONGO_URI` to your Atlas connection string
(Atlas → your cluster → **Connect** → **Drivers**), for example:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
```

In Atlas → **Network Access**, make sure your IP address is allowed
(for a college demo you can add `0.0.0.0/0` = allow from anywhere).

Start the server:

```bash
npm run dev      # auto-restarts when you save a file (uses nodemon)
# or
npm start        # plain node
```

You should see:

```
MongoDB connected: ... (database: internship_portal)
Sample data inserted: 3 users, 12 internships, 4 applications.   <- first run only
Server running at http://localhost:5000/api
```

To wipe the database and reload the sample data at any time:

```bash
npm run seed
```

Open http://localhost:5000/api in your browser. It should show `{"message":"Internship Portal API is running."}`.

### Terminal 2: Frontend

Click the **+** icon in the terminal panel to open a second terminal, then:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> Keep **both** terminals running while you use the app.

---

## 4. Test Credentials

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@portal.com     | admin123   |
| Student | student@portal.com   | student123 |
| Student | priya@portal.com     | student123 |

The login page also has **one-click buttons** that fill in these accounts.

### Sample data

- 12 internships across 8 categories (paid and unpaid; Remote, On-site and Hybrid)
- 2 internships have **past deadlines** ("Full Stack Web Intern" and "Flutter Mobile Developer Intern") to show the **Closed** badge and the disabled Apply button
- 4 sample applications, one in each status (Pending, Shortlisted, Accepted, Rejected)

Deadlines are calculated relative to the date you seed the database. If the demo deadlines have expired by the time you present, run `npm run seed` to refresh them.

---

## 5. Features

### Student
- Register and log in
- Browse internships as cards, with a single search box (title, company or location)
- Filter by category, paid/unpaid and mode; sort by newest or deadline
- View internship details with required skills shown as badges
- Apply with a resume URL and a cover letter (50–1000 characters)
- My Applications: status badges, admin remarks, and Withdraw (only while the status is Pending)
- Dashboard: total, pending, accepted and rejected counts, plus 3 recently posted internships
- Edit profile (name, phone, college, department, year, skills)

### Admin
- Dashboard: total internships, students and applications; counts per status; applications per category
- Add, edit and delete internships (a confirmation modal appears before delete; deleting also removes that internship's applications)
- Manage Applications: filter by internship and status, change status from a dropdown, and open a Review modal to read the cover letter and add a remark

### Business rules (enforced by the backend)
| Rule | HTTP code |
|------|-----------|
| Applying twice to the same internship | 409 |
| Applying after the deadline | 400 |
| Invalid resume URL / cover letter not 50–1000 characters | 400 |
| Withdrawing an application that is not Pending | 400 |
| Withdrawing another student's application | 403 |
| Missing/invalid token | 401 |
| Wrong role (e.g. a student calling an admin route) | 403 |
| Unknown route / missing item | 404 |

---

## 6. REST API Reference

Base URL: `http://localhost:5000/api`

Protected routes need this header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | Public | Register a student |
| POST | /auth/login | Public | Log in, returns `{ token, user }` |
| GET | /auth/me | Logged in | Current user |
| GET | /internships?search=&category=&paid=&mode=&sort= | Public | List internships (`paid=true/false`, `sort=newest/deadline`) |
| GET | /internships/:id | Public | One internship |
| POST | /internships | Admin | Create internship |
| PUT | /internships/:id | Admin | Update internship |
| DELETE | /internships/:id | Admin | Delete internship and its applications |
| POST | /applications | Student | Apply |
| GET | /applications/my | Student | My applications |
| DELETE | /applications/:id | Student | Withdraw (Pending only) |
| GET | /applications?internshipId=&status= | Admin | All applications |
| PATCH | /applications/:id/status | Admin | Body `{ status, adminRemark }` |
| PUT | /users/profile | Student | Update profile |
| GET | /stats/admin | Admin | Admin statistics |
| GET | /stats/student | Student | Student statistics |

All errors look like `{ "message": "..." }`.

---

## 7. Testing the API with Thunder Client or Postman

**Thunder Client** is a free VS Code extension (Extensions panel → search "Thunder Client"). Postman works the same way.

1. **Log in as admin**
   - `POST http://localhost:5000/api/auth/login`
   - Body → JSON:
     ```json
     { "email": "admin@portal.com", "password": "admin123" }
     ```
   - Copy the `token` from the response.

2. **Call a protected route**
   - `GET http://localhost:5000/api/stats/admin`
   - Auth tab → **Bearer** → paste the token (or add the header `Authorization: Bearer <token>`).

3. **Create an internship (admin token)**
   - `POST http://localhost:5000/api/internships`
     ```json
     {
       "title": "React Intern",
       "company": "Demo Corp",
       "location": "Remote",
       "mode": "Remote",
       "category": "Web Development",
       "description": "Build React components for our dashboard product.",
       "requiredSkills": ["React", "JavaScript"],
       "stipend": 10000,
       "duration": "3 months",
       "deadline": "2030-12-31",
       "openings": 2
     }
     ```

4. **Apply as a student**
   - Log in with `student@portal.com / student123` and copy that token.
   - `POST http://localhost:5000/api/applications`
     ```json
     {
       "internshipId": "i5",
       "resumeUrl": "https://drive.google.com/my-resume",
       "coverLetter": "I am very interested in this role because I have built several machine learning projects in college."
     }
     ```
   - Send the same request again and you get **409 Conflict**.
   - Use `"internshipId": "i11"` (past deadline) and you get **400 Bad Request**.

5. **Update a status (admin token)**
   - `PATCH http://localhost:5000/api/applications/a1/status`
     ```json
     { "status": "Shortlisted", "adminRemark": "Interview on Monday" }
     ```

6. **Try errors**
   - `GET http://localhost:5000/api/stats/admin` with a **student** token gives 403
   - `GET http://localhost:5000/api/unknown` gives 404

---

## 8. Troubleshooting

### CORS error in the browser console
`Access to XMLHttpRequest ... has been blocked by CORS policy`
- Make sure the frontend is opened at **http://localhost:5173** (not another port).
- The backend allows the origin in `CLIENT_URL` in `server/.env`. If you changed the frontend port, update `CLIENT_URL` and restart the backend.
- Restart the backend after editing `.env`.

### "Could not connect to MongoDB" when starting the backend
- Check `MONGO_URI` in `server/.env` (correct username, password and cluster name; no `<` `>` brackets left).
- If your password contains special characters like `@ : / ? #`, URL-encode them (e.g. `@` → `%40`).
- In Atlas → **Network Access**, add your current IP (or `0.0.0.0/0`). College/office Wi-Fi may block port 27017. Try a mobile hotspot.
- Errors like `SSL routines ... alert internal error` are usually temporary network problems. Just run the command again.

### "Cannot reach the server" toast / Network Error
- The backend is not running. Start it in Terminal 1 (`cd server && npm run dev`).
- Check that http://localhost:5000/api opens in the browser.

### Port already in use
**Backend (5000):** `Port 5000 is already in use`
- Another app (often another project's backend) is using port 5000. Stop it, **or** change the port:
  1. In `server/.env` set `PORT=5050`
  2. Create `client/.env` with `VITE_API_URL=http://localhost:5050/api`
  3. Restart both servers.

**Frontend (5173):** `Error: Port 5173 is already in use`
- Stop the other Vite app (press `Ctrl + C` in its terminal), **or** run on another port:
  1. `npm run dev -- --port 5174`
  2. In `server/.env` set `CLIENT_URL=http://localhost:5174` and restart the backend.

To find and stop whatever is using a port on Windows:
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```
On macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`.

### npm install fails
- Check that Node is v18 or newer: `node -v`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again.
- Clear the cache: `npm cache clean --force`
- If you see permission errors on Windows, close VS Code and reopen it (or avoid project folders synced by OneDrive while installing).
- Behind a college proxy? Try a different network (e.g. a mobile hotspot).

### "npm is not recognized" / "node is not recognized"
Node.js is not on your PATH. Reinstall Node.js from nodejs.org (tick "Add to PATH"), then **restart VS Code**.

### PowerShell says "running scripts is disabled on this system"
Run this once in PowerShell, then reopen the terminal:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
Or switch the VS Code terminal to **Command Prompt**.

### I was logged out / my new account disappeared
Running `npm run seed` deletes **all** data (including accounts you registered) and reloads the sample data. Log in again with the test credentials.

---

## 9. Available Scripts

| Folder | Command | What it does |
|--------|---------|--------------|
| server | `npm run dev` | Start API with nodemon (auto-restart) |
| server | `npm start` | Start API with node |
| server | `npm run seed` | Delete all data and reload the sample data |
| client | `npm run dev` | Start React dev server on port 5173 |
| client | `npm run build` | Production build into `client/dist` |
| client | `npm run preview` | Preview the production build |
