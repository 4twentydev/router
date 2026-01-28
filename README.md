# Router - Shop Task Assignment System

A web application for assigning and tracking tasks in a shop environment. Built with Next.js 16, Tailwind CSS 4, and Drizzle ORM with Neon PostgreSQL.

## Features

- **PIN-based Authentication**: 4-digit PIN codes for admin and employees
- **Admin Dashboard**: Create and assign tasks, manage employees
- **Employee Task List**: View assigned tasks and mark them complete
- **Pallet Builder Tasks**: Track job number, pallet number, dimensions, and material
- **Real-time Updates**: Task completions reflect on admin dashboard
- **Dark/Light Theme**: Toggle between themes with persistent preference

## Tech Stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Drizzle ORM
- Neon PostgreSQL
- Iron Session

## Getting Started

### Prerequisites

- Node.js 20+
- Neon PostgreSQL database

### Setup

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
SESSION_SECRET=your-super-secret-session-key-here-32-chars-min
```

4. Push the database schema:
```bash
npm run db:push
```

5. Create an admin user directly in the database:
```sql
INSERT INTO users (name, pin, role) VALUES ('Admin', '1234', 'admin');
```

6. Start the development server:
```bash
npm run dev
```

## Usage

### Admin

1. Enter your 4-digit admin PIN at the login screen
2. From the dashboard, you can:
   - Create pallet builder tasks and assign to employees
   - Add new employees with their 4-digit PINs
   - View all tasks and their completion status

### Employees

1. Enter your 4-digit employee PIN at the login screen
2. View your assigned tasks
3. Mark tasks as complete when finished

## Database Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio
