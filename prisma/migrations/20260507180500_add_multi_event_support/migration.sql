-- DropIndex
DROP INDEX "public"."teams_name_key";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "personId" TEXT;

-- AlterTable
ALTER TABLE "public"."teams" ADD COLUMN     "eventId" TEXT;

-- AlterTable
ALTER TABLE "public"."drink_logs" ADD COLUMN     "eventId" TEXT;

-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "eventId" TEXT;

-- AlterTable
ALTER TABLE "public"."commentaries" ADD COLUMN     "eventId" TEXT;

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."persons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- Seed default events
INSERT INTO "public"."events" ("id", "slug", "name", "isActive", "createdAt")
VALUES
    ('event_birthday_party_legacy', 'birthday-party-legacy', 'Birthday Party', true, CURRENT_TIMESTAMP),
    ('event_bachelor_party', 'bachelor-party', 'Bachelor Party', true, CURRENT_TIMESTAMP);

-- Backfill persons from legacy users
INSERT INTO "public"."persons" ("id", "name", "profile_image_url", "createdAt")
SELECT
    'person_' || "id",
    "name",
    "profile_image_url",
    "createdAt"
FROM "public"."users"
ON CONFLICT ("id") DO NOTHING;

-- Backfill event/person references on existing data before adding new constraints
UPDATE "public"."users"
SET
    "eventId" = COALESCE("eventId", 'event_birthday_party_legacy'),
    "personId" = COALESCE("personId", 'person_' || "id");

UPDATE "public"."teams"
SET "eventId" = COALESCE("eventId", 'event_birthday_party_legacy');

UPDATE "public"."drink_logs"
SET "eventId" = COALESCE("eventId", 'event_birthday_party_legacy');

UPDATE "public"."posts"
SET "eventId" = COALESCE("eventId", 'event_birthday_party_legacy');

UPDATE "public"."commentaries"
SET "eventId" = COALESCE("eventId", 'event_birthday_party_legacy');

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "public"."events"("slug");

-- CreateIndex
CREATE INDEX "users_eventId_idx" ON "public"."users"("eventId");

-- CreateIndex
CREATE INDEX "users_personId_idx" ON "public"."users"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "users_eventId_personId_key" ON "public"."users"("eventId", "personId");

-- CreateIndex
CREATE INDEX "teams_eventId_idx" ON "public"."teams"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_eventId_name_key" ON "public"."teams"("eventId", "name");

-- CreateIndex
CREATE INDEX "drink_logs_eventId_idx" ON "public"."drink_logs"("eventId");

-- CreateIndex
CREATE INDEX "posts_eventId_idx" ON "public"."posts"("eventId");

-- CreateIndex
CREATE INDEX "commentaries_eventId_idx" ON "public"."commentaries"("eventId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drink_logs" ADD CONSTRAINT "drink_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commentaries" ADD CONSTRAINT "commentaries_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
