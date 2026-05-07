ALTER TABLE "teams"
  ADD COLUMN "seedTag" TEXT;

ALTER TABLE "trivia_categories"
  ADD COLUMN "seedTag" TEXT;

ALTER TABLE "trivia_power_usage"
  ADD COLUMN "seedTag" TEXT;

ALTER TABLE "public_sightings"
  ADD COLUMN "seedTag" TEXT;

ALTER TABLE "hype_votes"
  ADD COLUMN "seedTag" TEXT;

ALTER TABLE "hype_events"
  ADD COLUMN "seedTag" TEXT;

CREATE INDEX "teams_seedTag_idx" ON "teams"("seedTag");
CREATE INDEX "trivia_categories_seedTag_idx" ON "trivia_categories"("seedTag");
CREATE INDEX "trivia_power_usage_seedTag_idx" ON "trivia_power_usage"("seedTag");
CREATE INDEX "public_sightings_seedTag_idx" ON "public_sightings"("seedTag");
CREATE INDEX "hype_votes_seedTag_idx" ON "hype_votes"("seedTag");
CREATE INDEX "hype_events_seedTag_idx" ON "hype_events"("seedTag");
