-- CreateTable
CREATE TABLE "public"."public_sightings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "photoUrl" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "submitterName" TEXT,
    "submitterCountry" TEXT,
    "message" TEXT,
    "actionType" TEXT NOT NULL DEFAULT 'spot',
    "points" INTEGER NOT NULL DEFAULT 1,
    "friendshipLevel" TEXT NOT NULL DEFAULT 'Witness',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "correctedLatitude" DOUBLE PRECISION,
    "correctedLongitude" DOUBLE PRECISION,
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "public_sightings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hype_votes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "suggestion" TEXT,
    "voterName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hype_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hype_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "voteThreshold" INTEGER NOT NULL DEFAULT 5,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hype_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_sightings_eventId_idx" ON "public"."public_sightings"("eventId");

-- CreateIndex
CREATE INDEX "public_sightings_status_idx" ON "public"."public_sightings"("status");

-- CreateIndex
CREATE INDEX "public_sightings_actionType_idx" ON "public"."public_sightings"("actionType");

-- CreateIndex
CREATE INDEX "hype_votes_eventId_idx" ON "public"."hype_votes"("eventId");

-- CreateIndex
CREATE INDEX "hype_events_eventId_idx" ON "public"."hype_events"("eventId");

-- AddForeignKey
ALTER TABLE "public"."public_sightings" ADD CONSTRAINT "public_sightings_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."public_sightings" ADD CONSTRAINT "public_sightings_approvedByUserId_fkey"
FOREIGN KEY ("approvedByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hype_votes" ADD CONSTRAINT "hype_votes_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hype_events" ADD CONSTRAINT "hype_events_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
