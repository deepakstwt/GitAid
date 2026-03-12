import { loadGitHubRepository } from './github-loader';
import { summarizeDocument, getEmbeddings } from './embeddings';
import { db } from '@/server/db';
import type { Document } from 'langchain/document';

/**
 * Index a GitHub repository for RAG with PGVector embeddings
 * @param projectId - Project ID to associate documents with
 * @param githubUrl - GitHub repository URL
 * @param githubToken - Optional GitHub access token
 * @returns Promise with processing results
 */
export async function indexGithubRepo(
  projectId: string,
  githubUrl: string,
  githubToken?: string
): Promise<{
  success: boolean;
  processedCount: number;
  skippedCount: number;
  errors: string[];
  message?: string;
}> {
  console.log(`Starting GitHub RAG indexing for: ${githubUrl}`);
  
  const results: {
    success: boolean;
    processedCount: number;
    skippedCount: number;
    errors: string[];
    message?: string;
  } = {
    success: false,
    processedCount: 0,
    skippedCount: 0,
    errors: [] as string[]
  };

  try {
    const docs = await loadGitHubRepository(githubUrl, githubToken);

    if (docs.length === 0) {
      console.warn('No documents found in repository. Private repo? Pass a GitHub token (project settings or env).');
      return {
        ...results,
        success: true,
        message: 'No files were loaded from the repo. If it’s private, add a GitHub token in project settings.',
      };
    }

    // Clear existing rows (including ghost rows with NULL embeddings from previous failed runs)
    // before re-indexing. Without this, the @@unique([projectId, fileName]) constraint
    // would throw on every re-index attempt.
    console.log('🗑️ Clearing existing embeddings for project before re-indexing...');
    await db.sourceCodeEmbedding.deleteMany({ where: { projectId } });
    console.log('✅ Cleared existing embeddings.');

    // Step 2: Filter relevant files
    const relevantDocs = filterRelevantDocuments(docs);
    console.log(`Processing ${relevantDocs.length} relevant files (skipped ${docs.length - relevantDocs.length})`);
    results.skippedCount = docs.length - relevantDocs.length;

    // Step 3: Process documents in small batches to avoid Gemini rate limits.
    // Processing all files in parallel would fire 100+ API calls at once on the free tier.
    const BATCH_SIZE = 3;
    const allProcessResults: Array<{ success: true; fileName: string; filePath: string; summary: string; embedding: number[]; sourceCode: string } | { success: false; fileName: string; error: string }> = [];

    for (let batchStart = 0; batchStart < relevantDocs.length; batchStart += BATCH_SIZE) {
      const batch = relevantDocs.slice(batchStart, batchStart + BATCH_SIZE);
      console.log(`⏳ Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(relevantDocs.length / BATCH_SIZE)} (files ${batchStart + 1}–${Math.min(batchStart + BATCH_SIZE, relevantDocs.length)})`);

      const batchResults = await Promise.allSettled(
        batch.map(async (doc, i) => {
          const fileName = extractFileName(doc);
          console.log(`  Processing file ${batchStart + i + 1}/${relevantDocs.length}: ${fileName}`);
          try {
            const summary = await summarizeCode(doc);
            const embedding = await generateEmbedding(summary);
            return {
              success: true as const,
              fileName,
              filePath: doc.metadata?.source || fileName,
              summary,
              embedding,
              sourceCode: doc.pageContent || ''
            };
          } catch (error) {
            console.error(`❌ Error processing ${fileName}:`, error);
            return {
              success: false as const,
              fileName,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled') allProcessResults.push(r.value);
        else allProcessResults.push({ success: false, fileName: 'unknown', error: String(r.reason) });
      }

      // Small delay between batches to respect rate limits
      if (batchStart + BATCH_SIZE < relevantDocs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const processResults = allProcessResults;

    // Step 5: Store in database
    console.log('💾 Storing results in database...');
    let successCount = 0;

    for (let i = 0; i < processResults.length; i++) {
      const result = processResults[i];
      
      if (!result) continue;
      
      if (result.success) {
        const { fileName, filePath, summary, embedding, sourceCode } = result;
        
        // Ensure all required fields are present
        if (!summary || !sourceCode) {
          results.errors.push(`Missing required data for ${fileName}`);
          continue;
        }
        
        try {
          // First, insert the record without embedding
          const record = await db.sourceCodeEmbedding.create({
            data: {
              projectId,
              fileName,
              filePath,
              summary,
              source: sourceCode
            }
          });

          // Use $executeRawUnsafe to inline the vector literal directly in SQL.
          // Prisma's $executeRaw (tagged template) cannot serialize a number[] as a
          // native `vector` type – it throws "Couldn't serialize value".
          // The record.id is still parameterized ($1) so there is no SQL injection risk.
          const vectorStr = '[' + embedding.join(',') + ']';
          await db.$executeRawUnsafe(
            `UPDATE "SourceCodeEmbedding" SET embedding = '${vectorStr}'::vector WHERE id = $1`,
            record.id
          );

          console.log(`Stored embedding for: ${fileName}`);
          successCount++;
        } catch (dbError) {
          console.error(`Database error for ${fileName}:`, dbError);
          results.errors.push(`Database error for ${fileName}: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
      } else {
        results.errors.push(`Processing error for ${result.fileName}: ${result.error}`);
      }
    }

    results.processedCount = successCount;
    results.success = true;
    if (successCount === 0 && results.errors.length > 0) {
      results.message = results.errors[0] ?? 'No files could be indexed. Check server logs.';
    } else if (successCount === 0 && relevantDocs.length === 0) {
      results.message = 'No code files matched (wrong extensions or all filtered out).';
    } else if (successCount === 0) {
      results.message = 'All files failed to process. For private repos, add a GitHub token in project settings.';
    }

    console.log(`GitHub RAG indexing completed`);
    console.log(`Results: ${successCount} processed, ${results.skippedCount} skipped, ${results.errors.length} errors`);

    return results;
  } catch (error) {
    console.error('Fatal error during GitHub RAG indexing:', error);
    results.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

/**
 * Summarize code using Gemini AI
 * @param doc - Document containing code
 * @returns Promise<string> - Summary of the code
 */
async function summarizeCode(doc: Document): Promise<string> {
  const fileName = extractFileName(doc);
  const pageContent = doc.pageContent;
  
  // Use the existing summarizeDocument function
  return await summarizeDocument(pageContent, fileName);
}

/**
 * Generate embedding for text using Gemini
 * @param text - Text to generate embedding for
 * @returns Promise<number[]> - Array of embedding values (768 dimensions)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Use the existing getEmbeddings function
  return await getEmbeddings(text);
}

/**
 * Filter documents to only include relevant code files
 * @param docs - All documents from repository
 * @returns Filtered array of relevant documents
 */
function filterRelevantDocuments(docs: Document[]): Document[] {
  return docs.filter(doc => {
    const source = doc.metadata?.source || '';
    const content = doc.pageContent || '';
    
    // Skip empty files
    if (content.trim().length === 0) return false;
    
    // Skip very large files (>100KB)
    if (content.length > 100000) return false;
    
    // Skip binary-like files and include only text-based code files
    const extension = source.split('.').pop()?.toLowerCase();
    const codeExtensions = [
      'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
      'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'clj',
      'md', 'txt', 'json', 'yml', 'yaml', 'xml', 'css', 'scss', 'less',
      'html', 'vue', 'svelte', 'sql', 'sh', 'bash', 'dockerfile'
    ];
    
    if (!extension || !codeExtensions.includes(extension)) return false;
    
    // Skip common non-essential files
    const fileName = source.split('/').pop()?.toLowerCase() || '';
    const skipPatterns = [
      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      '.gitignore', '.env', '.env.example',
      'node_modules/', 'dist/', 'build/', '.git/'
    ];
    
    return !skipPatterns.some(pattern => 
      fileName.includes(pattern) || source.includes(pattern)
    );
  });
}

/**
 * Extract filename from document metadata
 * @param doc - Document to extract filename from
 * @returns Filename string
 */
function extractFileName(doc: Document): string {
  const source = doc.metadata?.source || 'unknown_file';
  // Return the full relative path (e.g. "src/lib/utils.ts") to avoid
  // @@unique([projectId, fileName]) collisions when two files in different
  // directories share the same basename.
  return source;
}

/**
 * Query RAG system with vector similarity search
 * @param projectId - Project ID to search within
 * @param question - User's question
 * @param topK - Number of top similar documents to retrieve (default: 5)
 * @returns Promise with similar documents and AI-generated answer
 */
export async function queryRAGSystem(
  projectId: string,
  question: string,
  topK: number = 5
): Promise<{
  answer: string;
  sources: Array<{
    fileName: string;
    summary: string;
    sourceCode: string;
    similarity: number;
  }>;
}> {
  console.log(`Querying RAG system for: "${question}"`);
  
  try {
    // Step 1: Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    // Inline vector in SQL: Prisma cannot serialize vector as a bound param (error: "Couldn't serialize value")
    const vectorStr = '[' + questionEmbedding.join(',') + ']';

    // Step 2: Find similar documents using PGVector (vector inlined; only projectId and topK are bound)
    const similarDocs = await db.$queryRawUnsafe<
      Array<{ fileName: string; summary: string; sourceCode: string; similarity: number }>
    >(
      `SELECT "fileName", "summary", "source" as "sourceCode",
        1 - (embedding <=> '${vectorStr}'::vector) as similarity
       FROM "SourceCodeEmbedding"
       WHERE "projectId" = $1 AND embedding IS NOT NULL
       ORDER BY embedding <=> '${vectorStr}'::vector
       LIMIT $2`,
      projectId,
      topK
    );

    console.log(`Found ${similarDocs.length} similar documents`);

    if (similarDocs.length === 0) {
      return {
        answer: 'No relevant files found for this question. Try re-indexing the repository (INITIALIZE CONTEXT) or asking a different question.',
        sources: []
      };
    }

    // Step 3: Generate answer using retrieved context
    const { generateRAGAnswer } = await import('./embeddings');
    const context = similarDocs.map(doc => `File: ${doc.fileName}\nSummary: ${doc.summary}\nCode snippet:\n${doc.sourceCode.slice(0, 1000)}...`);
    const answer = await generateRAGAnswer(question, context);

    return {
      answer,
      sources: similarDocs
    };
  } catch (error: any) {
    console.error('❌ Error querying RAG system:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      answer: `Technical Protocol Exception: ${errorMessage}. This usually indicates a synchronization mismatch in the Semantic Context layer. Please ensure the repository is indexed.`,
      sources: []
    };
  }
}

export default {
  indexGithubRepo,
  queryRAGSystem,
};
