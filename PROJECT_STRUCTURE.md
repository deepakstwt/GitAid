# 📁 Project Structure Documentation

## Overview
This is a **Next.js 14+ Full-Stack Application** using the App Router with integrated frontend and backend.

---

## 🏗️ Architecture

```
git-gud-manager/
├── 🎨 FRONTEND (Client-Side)
│   ├── src/app/              # Next.js App Router (Pages & Layouts)
│   ├── src/components/       # Reusable React Components
│   └── src/styles/           # Global CSS & Tailwind
│
├── 🔧 BACKEND (Server-Side)
│   ├── src/server/           # Backend Logic & API
│   ├── src/lib/              # Utilities & Helpers
│   └── prisma/               # Database Schema & Migrations
│
└── 🔗 SHARED
    ├── src/trpc/             # tRPC Client/Server Setup
    ├── src/hooks/            # React Hooks
    └── public/               # Static Assets
```

---

## 📂 Detailed Structure

### 🎨 FRONTEND (Client-Side)

#### `src/app/` - Next.js Pages & Routes
```
src/app/
├── page.tsx                  # Landing page (/)
├── layout.tsx                # Root layout
├── loading.tsx               # Loading states
│
├── (protected)/              # Protected routes (requires auth)
│   ├── layout.tsx            # Protected layout with sidebar
│   ├── dashboard/            # Dashboard page
│   ├── qa/                   # Q&A page
│   ├── meetings/             # Meetings page
│   ├── billing/              # Billing page
│   ├── create/               # Create project page
│   └── projects/             # Projects page
│
├── sign-in/                  # Clerk sign-in page
├── sign-up/                  # Clerk sign-up page
│
└── api/                      # API Routes (Backend endpoints)
    ├── trpc/                 # tRPC endpoint
    ├── process-meeting/      # Meeting processing
    └── test-*/               # Test endpoints
```

**Purpose**: Defines all pages, layouts, and routing for the application.

#### `src/components/` - React Components
```
src/components/
├── ui/                       # shadcn/ui components (Button, Card, etc.)
├── DashboardWelcome.tsx      # Dashboard welcome screen
├── CodeReferences*.tsx       # Code reference displays
├── AskQuestionCard*.tsx      # Q&A components
├── CommitLog.tsx             # Git commit display
├── TeamMembers.tsx           # Team member management
└── ...                       # Other reusable components
```

**Purpose**: Reusable React components used across the app.

#### `src/styles/` - Styling
```
src/styles/
└── globals.css               # Global styles & Tailwind config
```

**Purpose**: Application-wide styling and CSS.

---

### 🔧 BACKEND (Server-Side)

#### `src/server/` - Backend Logic
```
src/server/
├── api/
│   ├── root.ts               # tRPC root router
│   ├── trpc.ts               # tRPC configuration
│   └── routers/              # API route handlers
│       ├── project.ts        # Project operations
│       └── ...               # Other routers
│
└── db.ts                     # Prisma database client
```

**Purpose**: All backend API logic, database operations, and business logic.

**Key Features**:
- **tRPC**: Type-safe API calls
- **Prisma ORM**: Database operations
- **Clerk Auth**: Authentication middleware

#### `prisma/` - Database
```
prisma/
├── schema.prisma             # Database schema definition
└── migrations/               # Database migrations
```

**Purpose**: Database schema, models, and migration history.

#### `src/lib/` - Utilities
```
src/lib/
├── github-loader.ts          # GitHub integration
├── gemini.ts                 # AI/Gemini integration
├── utils.ts                  # General utilities
└── ...                       # Other utilities
```

**Purpose**: Helper functions, utilities, and third-party integrations.

---

### 🔗 SHARED (Used by Both)

#### `src/trpc/` - tRPC Setup
```
src/trpc/
├── react.tsx                 # tRPC React hooks (Client)
└── server.ts                 # tRPC server caller (Server)
```

**Purpose**: Type-safe API communication between frontend and backend.

#### `src/hooks/` - React Hooks
```
src/hooks/
├── use-project.ts            # Project state hook
├── use-refetch.ts            # Data refetching hook
└── ...                       # Other custom hooks
```

**Purpose**: Reusable React hooks for state management and logic.

---

## 🔑 Key Concepts

### Frontend vs Backend in Next.js

**Frontend (Client Components)**:
- Files with `'use client'` directive
- React components with interactivity
- Browser-side JavaScript
- Located in: `src/components/`, some `src/app/` files

**Backend (Server Components/API)**:
- Default in Next.js App Router
- API routes in `src/app/api/`
- Server-side logic in `src/server/`
- Database operations via Prisma

**Hybrid (Server Components)**:
- Next.js pages without `'use client'`
- Can fetch data directly on server
- Render on server, sent as HTML

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **React 18**: UI library
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Lucide Icons**: Icon library

### Backend
- **Next.js API Routes**: Backend endpoints
- **tRPC**: Type-safe APIs
- **Prisma**: ORM for database
- **PostgreSQL**: Database
- **Clerk**: Authentication

### AI/ML
- **Google Gemini**: AI for code analysis
- **Pinecone**: Vector database (optional)

---

## 📝 File Naming Conventions

### Frontend
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Client Components**: Include `'use client'` at top

### Backend
- **API Routers**: `kebab-case.ts` (e.g., `project.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `github-loader.ts`)

### Shared
- **Hooks**: `use-kebab-case.ts` (e.g., `use-project.ts`)
- **Types**: `types.ts` or inline

---

## 🚀 Development Workflow

### Adding a New Page (Frontend)
1. Create folder in `src/app/`
2. Add `page.tsx` for the route
3. Optionally add `layout.tsx` for custom layout

### Adding a New API Endpoint (Backend)
1. Create router in `src/server/api/routers/`
2. Define procedures with tRPC
3. Add to root router in `src/server/api/root.ts`

### Adding a New Component (Frontend)
1. Create component in `src/components/`
2. Use `'use client'` if it needs interactivity
3. Import and use in pages

### Adding Database Models (Backend)
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Use in API routers via Prisma client

---

## 🔒 Authentication Flow

1. **Clerk** handles user authentication
2. **Middleware** (`src/middleware.ts`) protects routes
3. **tRPC Context** includes authenticated user
4. **Protected Procedures** require authentication

---

## 📦 Key Dependencies

### Frontend Dependencies
- `next`: Next.js framework
- `react`: React library
- `@clerk/nextjs`: Authentication
- `tailwindcss`: CSS framework
- `lucide-react`: Icons

### Backend Dependencies
- `@trpc/server`: tRPC backend
- `@prisma/client`: Database ORM
- `@google/generative-ai`: Gemini AI
- `octokit`: GitHub API

### Shared Dependencies
- `@trpc/react-query`: tRPC + React Query
- `zod`: Schema validation
- `typescript`: Type safety

---

## 🎯 Best Practices

### Frontend
✅ Use Server Components by default  
✅ Add `'use client'` only when needed  
✅ Keep components small and focused  
✅ Use TypeScript for type safety  

### Backend
✅ Use tRPC procedures for APIs  
✅ Validate inputs with Zod  
✅ Keep business logic in routers  
✅ Use Prisma for database operations  

### General
✅ Follow Next.js conventions  
✅ Use meaningful variable names  
✅ Add comments for complex logic  
✅ Test before committing  

---

## 🌊 Data Flow

```
User Interaction (Browser)
    ↓
React Component (Frontend)
    ↓
tRPC Hook (api.project.getAll.useQuery)
    ↓
tRPC Client (src/trpc/react.tsx)
    ↓
HTTP Request
    ↓
tRPC Server (src/server/api/root.ts)
    ↓
API Router (src/server/api/routers/project.ts)
    ↓
Prisma Client (src/server/db.ts)
    ↓
PostgreSQL Database
    ↓
Response flows back up the chain
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

1. Follow the existing structure
2. Keep frontend and backend concerns separated
3. Use TypeScript for type safety
4. Test your changes
5. Write meaningful commit messages

---

**Last Updated**: 2025-11-01  
**Maintainer**: GitAid Team

