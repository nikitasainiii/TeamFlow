# TeamFlow - My Full-Stack Task Manager

Hey everyone! 👋 This is **TeamFlow**, a full-stack web application I built as my final placement submission. It's essentially a project management tool (kinda like a simplified Jira or Trello) that lets teams collaborate, assign tasks, and track their progress through a Kanban board.

I wanted to build something that solves a real problem while showing off my skills in frontend design, backend API development, database relationships, and secure authentication. 

You can check out the live demo here: [https://tender-patience-production-0a21.up.railway.app/]([https://tender-patience-production-0a21.up.railway.app/])

---

## What can it do?

I tried to pack in as many essential features as possible to make it a genuinely useful tool:

- **Sign up & Login:** Fully secure authentication using JWTs. Your passwords are encrypted with bcrypt, so nobody (not even me!) can see them.
- **Project Workspaces:** You can create as many projects as you want and invite your teammates using their email addresses.
- **Kanban Board:** A clear board (To Do, In Progress, Done) to visually track how tasks are moving along.
- **Task Assignment:** As an admin, you can assign tasks to specific people, set priority levels (Low, Medium, High), and add due dates.
- **Role-Based Access (RBAC):** There are "Admins" and "Members". Admins have full control, while Members can only update the status of the tasks they've been specifically assigned to.
- **Dashboard:** A nice little overview page that shows your active projects, tasks you need to finish, and anything that's overdue.

---

## How I built it

I used my favorite modern web development stack to build this:

- **Frontend:** React.js (via Vite). I didn't use any heavy CSS libraries like Tailwind or Bootstrap because I wanted to write the CSS myself from scratch to achieve a custom "glassmorphism" dark mode look.
- **Backend:** Node.js with Express for the REST API.
- **Database:** PostgreSQL (I used SQLite during development for speed, but the production version runs on Postgres).
- **ORM:** Prisma (it makes working with SQL so much easier and safer).
- **Deployment:** The whole thing is configured to be deployed on Railway!

---

## How to run it locally

If you want to clone this and run it on your own machine, here is how you do it:

**First, get the backend running:**
1. Open your terminal and go to the `backend` folder: `cd backend`
2. Create a `.env` file (you can copy `.env.example`). You'll need to set the database URL and a random string for the `JWT_SECRET`.
3. Install the packages: `npm install`
4. Set up the database tables: `npx prisma db push`
5. Start the server: `npm run dev` (it runs on port 5001)

**Then, start the frontend:**
1. Open a new terminal tab and go to the `frontend` folder: `cd frontend`
2. Create a `.env` file and point it to the backend: `VITE_API_URL=http://localhost:5001/api`
3. Install the packages: `npm install`
4. Start the Vite server: `npm run dev`
5. Open `http://localhost:5173` in your browser!

---

## API Documentation

If you want to test the endpoints via Postman or Curl, here's a quick summary of what I built:

**Authentication**
- `POST /api/auth/signup` - Register a new account
- `POST /api/auth/login` - Login and get a token
- `GET /api/auth/me` - Get logged-in user details

**Projects & Members**
- `GET /api/projects` - Get all your projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details (tasks, members)
- `POST /api/projects/:id/members` - Invite someone to your project

**Tasks**
- `POST /api/projects/:id/tasks` - Create a task
- `PUT /api/projects/:id/tasks/:taskId` - Update a task (status, assignee, etc.)
- `DELETE /api/projects/:id/tasks/:taskId` - Delete a task

---

## Project Structure

If you're exploring the codebase, here's how I organized everything:
- `backend/src/controllers/` - The business logic for handling API requests
- `backend/src/routes/` - The Express router definitions
- `backend/src/middleware/` - Where the magic happens for JWT verification and role checks
- `backend/prisma/schema.prisma` - The database schema definition
- `frontend/src/components/` - Reusable UI components like the Kanban board and Modals
- `frontend/src/pages/` - The main views (Dashboard, Project Detail, etc.)
- `frontend/src/context/AuthContext.jsx` - Global state for managing the user's login session

---

