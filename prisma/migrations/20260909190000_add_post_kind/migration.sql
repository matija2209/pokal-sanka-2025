-- Reels are greenfield content. Existing rows retain normal post behavior.
CREATE TYPE "PostKind" AS ENUM ('post', 'reel');

ALTER TABLE "posts"
ADD COLUMN "kind" "PostKind" NOT NULL DEFAULT 'post';

CREATE INDEX "posts_eventId_kind_createdAt_idx"
ON "posts"("eventId", "kind", "createdAt" DESC);
