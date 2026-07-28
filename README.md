# Prisma Todo

Full-stack todo app built with **Next.js**, **NestJS**, **Prisma**, **MongoDB**, and **JWT** auth.

## Stack

- **Frontend**: Next.js 14 (App Router), TanStack Query, Tailwind, shadcn/ui
- **Backend**: NestJS, Prisma ORM, Passport JWT, bcrypt
- **Database**: MongoDB

## Ports

| App | URL |
|-----|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8000 |

## Quick start

### Backend

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma:push
pnpm dev
```

Create `backend/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/prisma-todo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3001
PORT=8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_JWT_STORAGE_KEY=authToken
```

## Features

- JWT register / login
- System lists: My Day, Important, Tasks
- Custom lists (create, rename, delete)
- Tasks: complete, edit, move, My Day, delete
- Grouped active / completed tasks

## License

MIT
