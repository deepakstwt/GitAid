import { projectRouter } from "@/server/api/routers/project";
import { ragRouter } from "@/server/api/routers/rag";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  rag: ragRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
