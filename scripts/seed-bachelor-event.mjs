import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, 'data', 'bachelor-event')
const SEED_TAG = 'bachelor-bootstrap-v1'
const DROP_ONLY = process.argv.includes('--drop-only')
const BACHELOR_EVENT = {
  slug: 'bachelor-party',
  name: 'Bachelor Party',
}

function subtractHours(date, hours) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName)
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content)
}

async function ensureSeedSchema() {
  const rows = await prisma.$queryRaw`
    SELECT
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'seedTag'
      ) AS "teamSeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'trivia_categories' AND column_name = 'seedTag'
      ) AS "triviaCategorySeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'trivia_power_usage' AND column_name = 'seedTag'
      ) AS "triviaPowerUsageSeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'public_sightings' AND column_name = 'seedTag'
      ) AS "publicSightingSeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'hype_votes' AND column_name = 'seedTag'
      ) AS "hypeVoteSeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'hype_events' AND column_name = 'seedTag'
      ) AS "hypeEventSeedTag",
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'trivia_categories' AND column_name = 'id'
      ) AS "triviaAvailable"
  `

  const status = rows[0] ?? {}
  if (
    !status.teamSeedTag
    || !status.triviaCategorySeedTag
    || !status.triviaPowerUsageSeedTag
    || !status.publicSightingSeedTag
    || !status.hypeVoteSeedTag
    || !status.hypeEventSeedTag
    || !status.triviaAvailable
  ) {
    throw new Error('Seed tag columns or trivia tables are missing. Run Prisma migrations before seeding.')
  }
}

async function getOrCreateBachelorEvent() {
  const existing = await prisma.event.findUnique({
    where: { slug: BACHELOR_EVENT.slug },
  })

  if (existing) {
    return existing
  }

  return prisma.event.create({
    data: {
      slug: BACHELOR_EVENT.slug,
      name: BACHELOR_EVENT.name,
      isActive: true,
    },
  })
}

async function getBachelorEvent() {
  return prisma.event.findUnique({
    where: { slug: BACHELOR_EVENT.slug },
  })
}

async function loadSeedData() {
  const [hypeVotes, hypeEvents, triviaCategories, legacyTeams, legacySightings, legacyPowerUsage] = await Promise.all([
    readJson('hype-votes.json'),
    readJson('hype-events.json'),
    readJson('trivia-categories.json'),
    readJson('teams.json'),
    readJson('sightings.json'),
    readJson('power-usage.json'),
  ])

  return {
    hypeVotes,
    hypeEvents,
    triviaCategories,
    legacyTeams,
    legacySightings,
    legacyPowerUsage,
  }
}

async function clearSeededBachelorData(eventId, seedData) {
  const teamNames = seedData.legacyTeams.map((team) => team.name)
  const triviaTitles = seedData.triviaCategories.map((category) => category.title)
  const hypeEventTitles = seedData.hypeEvents.map((event) => event.title)
  const hypeVoteKeys = seedData.hypeVotes.map((vote) => ({
    voterName: vote.voterName ?? null,
    suggestion: vote.suggestion ?? null,
  }))
  const sightingPhotoUrls = seedData.legacySightings
    .map((_, index) => `/logo.jpg?seed-sighting=${index + 1}`)
  const powerUsageNotes = seedData.legacyPowerUsage
    .map((usage) => usage.note ?? null)
    .filter((note) => note !== null)

  const seededTeams = await prisma.team.findMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { name: { in: teamNames } },
      ],
    },
    select: { id: true },
  })

  const seededTeamIds = seededTeams.map((team) => team.id)
  if (seededTeamIds.length > 0) {
    await prisma.user.updateMany({
      where: { teamId: { in: seededTeamIds } },
      data: { teamId: null },
    })
  }

  await prisma.triviaPowerUsage.deleteMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        ...(powerUsageNotes.length > 0 ? [{ note: { in: powerUsageNotes } }] : []),
      ],
    },
  })

  const seededCategories = await prisma.triviaCategory.findMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { title: { in: triviaTitles } },
      ],
    },
    select: { id: true },
  })

  const categoryIds = seededCategories.map((category) => category.id)
  if (categoryIds.length > 0) {
    await prisma.triviaCategoryResult.deleteMany({
      where: { categoryId: { in: categoryIds } },
    })

    await prisma.triviaQuestion.deleteMany({
      where: { categoryId: { in: categoryIds } },
    })
  }

  await prisma.triviaCategory.deleteMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { title: { in: triviaTitles } },
      ],
    },
  })

  for (const vote of hypeVoteKeys) {
    await prisma.hypeVote.deleteMany({
      where: {
        eventId,
        voterName: vote.voterName,
        suggestion: vote.suggestion,
      },
    })
  }

  await prisma.hypeVote.deleteMany({
    where: { eventId, seedTag: SEED_TAG },
  })

  await prisma.hypeEvent.deleteMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { title: { in: hypeEventTitles } },
      ],
    },
  })

  await prisma.publicSighting.deleteMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { photoUrl: { in: sightingPhotoUrls } },
      ],
    },
  })

  await prisma.team.deleteMany({
    where: {
      eventId,
      OR: [
        { seedTag: SEED_TAG },
        { name: { in: teamNames } },
      ],
    },
  })
}

async function seedHype(eventId, now, hypeVotes, hypeEvents) {
  for (let index = 0; index < hypeVotes.length; index += 1) {
    const vote = hypeVotes[index]
    await prisma.hypeVote.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        voterName: vote.voterName ?? null,
        suggestion: vote.suggestion ?? null,
        createdAt: subtractHours(now, 18 - index),
      },
    })
  }

  for (const event of hypeEvents) {
    await prisma.hypeEvent.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        title: event.title,
        description: event.description ?? null,
        status: event.status,
        voteThreshold: event.voteThreshold,
        voteCount: event.voteCount,
        unlockedAt: event.unlockedHoursAgo === null ? null : subtractHours(now, event.unlockedHoursAgo),
        completedAt: event.completedHoursAgo === null ? null : subtractHours(now, event.completedHoursAgo),
        createdAt: subtractHours(now, event.createdHoursAgo),
      },
    })
  }

  return {
    voteCount: hypeVotes.length,
    eventCount: hypeEvents.length,
  }
}

async function seedTrivia(eventId, now, triviaCategories) {
  const createdCategories = []

  for (let categoryIndex = 0; categoryIndex < triviaCategories.length; categoryIndex += 1) {
    const categorySeed = triviaCategories[categoryIndex]

    const category = await prisma.triviaCategory.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        title: categorySeed.title,
        description: categorySeed.description ?? null,
        status: categorySeed.status,
        createdBy: `seed:${SEED_TAG}`,
        createdAt: subtractHours(now, 48 - categoryIndex * 4),
      },
    })

    createdCategories.push(category)

    for (let questionIndex = 0; questionIndex < categorySeed.questions.length; questionIndex += 1) {
      const question = categorySeed.questions[questionIndex]
      await prisma.triviaQuestion.create({
        data: {
          categoryId: category.id,
          questionNumber: questionIndex + 1,
          questionText: question.text,
          questionType: question.type === 'numeric' ? 'numeric' : 'text',
          correctAnswer: question.answer ?? null,
          numericAnswer: question.numericAnswer ?? null,
          allowClosest: question.allowClosest ?? false,
          notes: question.type === 'numeric' ? 'Exact answer worth bonus if configured.' : null,
          createdAt: subtractHours(now, 48 - categoryIndex * 4),
        },
      })
    }
  }

  return {
    categoryCount: createdCategories.length,
    questionCount: triviaCategories.reduce((count, category) => count + category.questions.length, 0),
  }
}

async function main() {
  await ensureSeedSchema()

  const now = new Date()
  const seedData = await loadSeedData()
  const bachelorEvent = DROP_ONLY
    ? await getBachelorEvent()
    : await getOrCreateBachelorEvent()

  if (!bachelorEvent) {
    console.log(`Bachelor event "${BACHELOR_EVENT.slug}" does not exist. Nothing to drop.`)
    return
  }

  await clearSeededBachelorData(bachelorEvent.id, seedData)

  if (DROP_ONLY) {
    console.log(`Dropped seeded bachelor bootstrap data from: ${bachelorEvent.name} (${bachelorEvent.id})`)
    console.log(`Seed tag: ${SEED_TAG}`)
    console.log('Kept existing event, users, and other non-seeded rows intact.')
    return
  }

  const hype = await seedHype(bachelorEvent.id, now, seedData.hypeVotes, seedData.hypeEvents)
  const trivia = await seedTrivia(bachelorEvent.id, now, seedData.triviaCategories)

  console.log(`Seed tag: ${SEED_TAG}`)
  console.log(`Seeded bachelor event: ${bachelorEvent.name} (${bachelorEvent.id})`)
  console.log(`Hype: ${hype.voteCount} votes, ${hype.eventCount} events`)
  console.log(`Trivia: ${trivia.categoryCount} categories, ${trivia.questionCount} questions`)
}

main()
  .catch((error) => {
    console.error('Failed to seed bachelor event')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
