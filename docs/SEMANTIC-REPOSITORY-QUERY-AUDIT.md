# Semantic Repository Query – Audit Report

**Section:** Repository Context / PLATFORM CORE / Semantic Query Protocol  
**Component:** `AICodeAssistantCard.tsx` + RAG (PGVector) backend  
**Date:** 2026-03-12

---

## 1. What This Section Does

- **UI:** “Repository Context” card with “INDEXED: N FILES”, suggested queries, and a chat-style Q&A.
- **Flow:** User selects a project → (optional) clicks “INITIALIZE CONTEXT” to index the GitHub repo → asks a question → backend runs vector search over `SourceCodeEmbedding` and Gemini to return an answer.

**Data path:**

1. **Index:** `indexGithubRepository` (tRPC) → `indexGithubRepo` (github-rag-indexer) → `loadGitHubRepository` → summarize + embed → write to `SourceCodeEmbedding`.
2. **Stats:** `getPGVectorStats` (tRPC) → count `SourceCodeEmbedding` for project → “INDEXED: N FILES”.
3. **Query:** `queryPGVector` (tRPC) → `queryRAGSystem` → embed question → raw SQL similarity search on `SourceCodeEmbedding` → `generateRAGAnswer` (Gemini) → return answer + sources.

---

## 2. Issues Found

### 2.1 **Suggestion buttons do not run the query (UX)**

- **Where:** `AICodeAssistantCard.tsx` – the three suggestion buttons (“Explain terminal project architecture”, etc.).
- **Current behavior:** `onClick={() => setQuestion(suggestion.text)}` only fills the input. User must press Enter or click Send.
- **Impact:** It feels like “this section is not working” because one click does nothing visible except putting text in the box.
- **Fix:** On suggestion click, set the question **and** submit the query (same as form submit).

### 2.2 **PGVector query parameter format (possible backend failure)**

- **Where:** `github-rag-indexer.ts` – `queryRAGSystem` uses `$queryRaw` with `${questionEmbedding as any}::vector`.
- **Risk:** Prisma/Node may pass the embedding array in a form PostgreSQL’s `vector` type does not accept (e.g. as an array type), causing the query to fail or return no rows.
- **Fix:** Pass the embedding as a string and cast to `vector`, e.g. use `JSON.stringify(questionEmbedding)` when binding the embedding in the raw SQL.

### 2.3 **Empty context when no similar docs**

- **Where:** `queryRAGSystem` – if `similarDocs.length === 0`, it still calls `generateRAGAnswer(question, [])`.
- **Impact:** User gets a generic Gemini answer with no code context, which can look broken or irrelevant.
- **Improvement:** If there are no similar documents, return a clear message (“No relevant files found. Try re-indexing or a different question.”) instead of calling the model with empty context.

### 2.4 **Gemini / embedding dependencies**

- **RAG answer:** `generateRAGAnswer` in `embeddings.ts` uses `gemini-2.0-flash` (already aligned with your working model list).
- **Embeddings:** `getEmbeddings` uses `text-embedding-004`; on failure it uses a 768-d fallback, which matches `vector(768)` in the DB. If the embedding API fails often, quality will degrade but the flow should not crash.

### 2.5 **Indexing can fail silently for private repos**

- **Where:** `loadGitHubRepository` (github-loader) – if the project has no or invalid `githubToken`, private repo fetch can fail; indexing then stores 0 files.
- **Impact:** “INDEXED: 0 FILES” or old count; queries return no or poor results. Not a bug in the Semantic Query UI itself, but a common reason “it doesn’t work.”

---

## 3. Summary Table

| # | Issue                         | Severity   | Component              | Fix / action                                  |
|---|-------------------------------|------------|------------------------|-----------------------------------------------|
| 1 | Suggestions don’t submit      | High (UX)  | AICodeAssistantCard    | Submit query on suggestion click              |
| 2 | Vector param format in SQL    | High       | github-rag-indexer     | Bind embedding as string, cast to ::vector   |
| 3 | Empty context still calls AI  | Medium     | github-rag-indexer     | Early return with friendly message           |
| 4 | Gemini model / embeddings     | Low        | embeddings.ts          | Already consistent; monitor errors           |
| 5 | Private repo / token          | Env/setup  | github-loader + config | Ensure project has valid GitHub token         |

---

## 4. Recommended Fixes (in order)

1. **Suggestion buttons:** In `AICodeAssistantCard.tsx`, on suggestion click: set question, then call the same submit handler used for the form (so the query runs immediately).
2. **PGVector query:** In `queryRAGSystem`, build the embedding literal for the raw query using `JSON.stringify(questionEmbedding)` (or equivalent safe string) and use that in the `ORDER BY ... <=> ...::vector` and `WHERE` so PostgreSQL receives a valid vector.
3. **Empty context:** In `queryRAGSystem`, if `similarDocs.length === 0`, return a structured response with a clear message and empty sources; do not call `generateRAGAnswer` with empty context.
4. **Optional:** Show a short “Running query…” state when a suggestion is clicked so the user sees that the section is working.

---

## 5. How to Verify After Fixes

1. Pick a project with a GitHub URL and run “INITIALIZE CONTEXT”; wait until “INDEXED: N FILES” (N > 0) and no error toasts.
2. Click one of the three suggestion buttons: the query should run immediately and an answer (or “no relevant files”) should appear.
3. Type a custom question and Send: same behavior.
4. In server logs, confirm no raw SQL or embedding errors when running a query.
5. If the repo is private, ensure the project has a valid GitHub token so indexing and stats match reality.

This audit and the fixes below address the main reasons the Semantic Repository Query section can appear “not working at all.”
