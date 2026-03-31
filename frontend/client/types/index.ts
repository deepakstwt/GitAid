/**
 * Shared frontend types — single source of truth.
 * Import from "@/client/types" across all components.
 */

export interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}
