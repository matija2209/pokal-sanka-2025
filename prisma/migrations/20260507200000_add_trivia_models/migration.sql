-- CreateTable
CREATE TABLE "public"."trivia_categories" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trivia_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trivia_questions" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'text',
    "correctAnswer" TEXT,
    "numericAnswer" DOUBLE PRECISION,
    "allowClosest" BOOLEAN NOT NULL DEFAULT false,
    "media" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trivia_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trivia_category_results" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question1Winner" TEXT,
    "question2Winner" TEXT,
    "question3Winner" TEXT,
    "scenario" TEXT NOT NULL,
    "categoryWinner" TEXT,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "numericBonus" INTEGER NOT NULL DEFAULT 0,
    "finalPoints" INTEGER NOT NULL DEFAULT 0,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "publishedToScoreboard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trivia_category_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trivia_power_usage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "userId" TEXT NOT NULL,
    "powerType" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "categoryId" TEXT,
    "targetUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trivia_power_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trivia_categories_eventId_idx" ON "public"."trivia_categories"("eventId");

-- CreateIndex
CREATE INDEX "trivia_questions_categoryId_idx" ON "public"."trivia_questions"("categoryId");

-- CreateIndex
CREATE INDEX "trivia_category_results_categoryId_idx" ON "public"."trivia_category_results"("categoryId");

-- CreateIndex
CREATE INDEX "trivia_power_usage_eventId_idx" ON "public"."trivia_power_usage"("eventId");

-- CreateIndex
CREATE INDEX "trivia_power_usage_userId_idx" ON "public"."trivia_power_usage"("userId");

-- AddForeignKey
ALTER TABLE "public"."trivia_categories" ADD CONSTRAINT "trivia_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trivia_questions" ADD CONSTRAINT "trivia_questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."trivia_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trivia_category_results" ADD CONSTRAINT "trivia_category_results_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."trivia_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trivia_power_usage" ADD CONSTRAINT "trivia_power_usage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
