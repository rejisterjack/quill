-- Switch text embeddings to 1024 dimensions for the free OpenRouter model
-- (liquid/lfm-2.5-embedding-350m:free). Vectors from the previous 768-dim model
-- are invalid after the switch, so the column is rebuilt; affected documents
-- must be re-embedded (re-upload or re-process them).

ALTER TABLE "document_chunks" DROP COLUMN "embedding";

ALTER TABLE "document_chunks"
  ADD COLUMN "embedding" vector(1024);

CREATE INDEX "document_chunks_embedding_hnsw_idx"
  ON "document_chunks"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 32, ef_construction = 128);
