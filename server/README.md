# 🔧 Server Directory

This directory contains all **backend logic and API implementations**.

## 📁 Structure

```
src/server/
├── api/
│   ├── root.ts           # Main tRPC router (combines all routers)
│   ├── trpc.ts           # tRPC configuration & middleware
│   └── routers/          # Individual API routers
│       ├── project.ts    # Project-related operations
│       └── ...           # Other domain routers
│
└── db.ts                 # Prisma database client instance
```

## 🎯 Purpose

This is where all **server-side logic** lives:
- API endpoints (via tRPC)
- Database operations (via Prisma)
- Business logic
- Authentication checks
- Data validation

## 🔌 tRPC Architecture

### What is tRPC?
tRPC provides **type-safe APIs** without code generation. Frontend automatically gets TypeScript types from backend procedures.

### Flow
```
Frontend → tRPC Client → HTTP → tRPC Server → Router → Procedure → Database
```

## 📂 Key Files

### `api/trpc.ts` - Configuration
Defines tRPC setup, context, and middleware.

**Context**: Data available to all procedures
```typescript
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  return {
    db: prisma,
    userId: session?.userId,
    ...opts,
  };
};
```

**Middleware**: Auth checks, logging, etc.
```typescript
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
```

**Procedures**:
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authentication

### `api/root.ts` - Main Router
Combines all individual routers into one.

```typescript
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  // ... other routers
});

export type AppRouter = typeof appRouter;
```

### `api/routers/` - Domain Routers
Individual routers for different features.

**Example**: `api/routers/project.ts`
```typescript
export const projectRouter = createTRPCRouter({
  // Get all projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { userId: ctx.userId }
    });
  }),

  // Get one project
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
        where: { id: input.id }
      });
    }),

  // Create project
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      githubUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          ...input,
          userId: ctx.userId,
        }
      });
    }),
});
```

### `db.ts` - Database Client
Singleton Prisma client instance.

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

## 🛠️ Creating New API Endpoints

### 1. Create a Router File

Create `src/server/api/routers/my-feature.ts`:

```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const myFeatureRouter = createTRPCRouter({
  // Query (GET) - fetch data
  getItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.myModel.findMany();
  }),

  // Query with input
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.myModel.findUnique({
        where: { id: input.id }
      });
    }),

  // Mutation (POST/PUT/DELETE) - modify data
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.myModel.create({
        data: {
          ...input,
          userId: ctx.userId,
        }
      });
    }),

  // Update
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.myModel.update({
        where: { id: input.id },
        data: { name: input.name }
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.myModel.delete({
        where: { id: input.id }
      });
    }),
});
```

### 2. Add to Root Router

Update `src/server/api/root.ts`:

```typescript
import { myFeatureRouter } from './routers/my-feature';

export const appRouter = createTRPCRouter({
  project: projectRouter,
  myFeature: myFeatureRouter, // ← Add here
});
```

### 3. Use in Frontend

```typescript
'use client';

import { api } from '@/trpc/react';

export function MyComponent() {
  // Query
  const { data, isLoading } = api.myFeature.getItems.useQuery();

  // Mutation
  const createMutation = api.myFeature.create.useMutation();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: 'New Item',
      description: 'Description',
    });
  };

  return <div>{/* UI */}</div>;
}
```

## 🔑 Key Concepts

### Query vs Mutation
- **Query**: Read data (GET) - use `.query()`
- **Mutation**: Modify data (POST/PUT/DELETE) - use `.mutation()`

### Input Validation
Always validate inputs with **Zod**:
```typescript
.input(z.object({
  email: z.string().email(),
  age: z.number().min(18).max(100),
  role: z.enum(['admin', 'user']),
}))
```

### Error Handling
```typescript
import { TRPCError } from '@trpc/server';

if (!project) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Project not found',
  });
}
```

### Authentication
Use `protectedProcedure` for authenticated routes:
```typescript
// ✅ Requires auth
export const getMyData = protectedProcedure.query(async ({ ctx }) => {
  // ctx.userId is guaranteed to exist
  return ctx.db.user.findUnique({ where: { id: ctx.userId } });
});

// ❌ No auth required
export const getPublicData = publicProcedure.query(async ({ ctx }) => {
  // Anyone can call this
  return ctx.db.publicData.findMany();
});
```

## 📊 Database Operations (Prisma)

### Find Operations
```typescript
// Find many
const projects = await ctx.db.project.findMany({
  where: { userId: ctx.userId },
  include: { commits: true },
  orderBy: { createdAt: 'desc' },
  take: 10, // Limit
});

// Find unique
const project = await ctx.db.project.findUnique({
  where: { id: projectId },
});

// Find first
const latestCommit = await ctx.db.commit.findFirst({
  orderBy: { createdAt: 'desc' },
});
```

### Create Operations
```typescript
const project = await ctx.db.project.create({
  data: {
    name: input.name,
    githubUrl: input.githubUrl,
    userId: ctx.userId,
  },
});
```

### Update Operations
```typescript
const updated = await ctx.db.project.update({
  where: { id: input.id },
  data: { name: input.name },
});
```

### Delete Operations
```typescript
await ctx.db.project.delete({
  where: { id: input.id },
});
```

### Relations
```typescript
// Create with relations
const project = await ctx.db.project.create({
  data: {
    name: input.name,
    commits: {
      create: [
        { message: 'Initial commit', hash: 'abc123' },
      ],
    },
  },
  include: { commits: true },
});
```

## 🎯 Best Practices

### ✅ Do
- Use Zod for input validation
- Use TypeScript types
- Handle errors properly
- Use protectedProcedure for auth
- Keep procedures focused
- Add meaningful error messages

### ❌ Don't
- Skip input validation
- Expose sensitive data
- Put business logic in frontend
- Ignore error handling
- Make procedures too complex

## 🔒 Security

### Authentication
Always check user permissions:
```typescript
const project = await ctx.db.project.findUnique({
  where: { id: input.id },
});

if (project.userId !== ctx.userId) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### Input Sanitization
Zod handles this automatically:
```typescript
.input(z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
}))
```

## 📚 Resources

- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)

---

**Remember**: All backend logic should live in this directory. Keep it organized, type-safe, and secure!

