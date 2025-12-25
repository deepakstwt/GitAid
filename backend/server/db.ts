import { PrismaClient } from "@prisma/client";
import { env } from "@/server/config/env";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
  
  // Test connection on initialization
  client.$connect().catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('💡 Tip: Neon databases may be paused. Check your Neon dashboard.');
  });
  
  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionError = 
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout");
    
    if (retries > 0 && isConnectionError) {
      console.log(
        `⚠️ Database connection failed, retrying in ${RETRY_DELAY}ms... (${retries} attempts left)`
      );
      console.log(`Error: ${errorMessage}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    console.error('❌ Database operation failed:', errorMessage);
    throw error;
  }
}
