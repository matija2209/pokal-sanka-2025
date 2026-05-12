-- CreateTable
CREATE TABLE "event_landing_pages" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "galleryImages" JSONB NOT NULL DEFAULT '[]',
    "ctaText" TEXT NOT NULL DEFAULT 'Enter',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_landing_pages_eventId_key" ON "event_landing_pages"("eventId");

-- AddForeignKey
ALTER TABLE "event_landing_pages" ADD CONSTRAINT "event_landing_pages_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
