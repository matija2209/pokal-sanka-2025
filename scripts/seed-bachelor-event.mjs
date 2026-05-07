import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, 'data', 'bachelor-event')
const SEED_TAG = 'bachelor-bootstrap-v1'
const BACHELOR_EVENT = {
  slug: 'bachelor-party',
  name: 'Bachelor Party',
}

const ACTION_POINTS = {
  spot: 1,
  message: 2,
  say_hi: 4,
  drink_together: 6,
  photo_together: 9,
  challenge: 17,
}

const ACTION_FRIENDSHIP = {
  spot: 'Witness',
  message: 'Messenger',
  say_hi: 'Acquaintance',
  drink_together: 'Drinking Buddy',
  photo_together: 'Collected Friend',
  challenge: 'Legendary Friend',
}

function subtractHours(date, hours) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

function getPhotoUrl(index) {
  return `/logo.jpg?seed-sighting=${index + 1}`
}

async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName)
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content)
}

function calculateTriviaCategoryResult({ q1Winner, q2Winner, q3Winner, hasNumericBonus }) {
  const winners = [q1Winner, q2Winner, q3Winner].filter(Boolean)

  let scenario
  let categoryWinner
  let basePoints

  if (winners.length === 0) {
    scenario = 'No Score'
    categoryWinner = null
    basePoints = 0
  } else {
    const winCounts = new Map()
    for (const winner of winners) {
      winCounts.set(winner, (winCounts.get(winner) || 0) + 1)
    }

    const maxWins = Math.max(...winCounts.values(), 0)

    if (maxWins === 3) {
      categoryWinner = [...winCounts.entries()].find(([, count]) => count === 3)[0]
      scenario = 'Godlike'
      basePoints = 6
    } else if (maxWins === 2) {
      categoryWinner = [...winCounts.entries()].find(([, count]) => count === 2)[0]
      scenario = 'Two Wins'
      basePoints = 2
    } else if (winners.length === 3) {
      categoryWinner = q3Winner
      scenario = 'Steal Yo GF'
      basePoints = 1
    } else {
      categoryWinner = winners[0]
      scenario = 'Single Win'
      basePoints = 1
    }
  }

  const numericBonus = hasNumericBonus ? 1 : 0
  return {
    scenario,
    categoryWinner,
    basePoints,
    numericBonus,
    finalPoints: basePoints + numericBonus,
  }
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

async function loadSeedData() {
  const [teams, sightings, hypeVotes, hypeEvents, triviaCategories, powerUsage] = await Promise.all([
    readJson('teams.json'),
    readJson('sightings.json'),
    readJson('hype-votes.json'),
    readJson('hype-events.json'),
    readJson('trivia-categories.json'),
    readJson('power-usage.json'),
  ])

  return { teams, sightings, hypeVotes, hypeEvents, triviaCategories, powerUsage }
}

async function ensureBachelorUsers(eventId) {
  const persons = await prisma.person.findMany({
    orderBy: { name: 'asc' },
  })

  if (persons.length === 0) {
    throw new Error('No Person rows found. Seed/import people before running the bachelor seed script.')
  }

  for (const person of persons) {
    await prisma.user.upsert({
      where: {
        eventId_personId: {
          eventId,
          personId: person.id,
        },
      },
      update: {
        name: person.name,
      },
      create: {
        eventId,
        personId: person.id,
        name: person.name,
      },
    })
  }

  return prisma.user.findMany({
    where: { eventId },
    orderBy: [
      { name: 'asc' },
      { createdAt: 'asc' },
    ],
  })
}

async function clearSeededBachelorData(eventId, seedData) {
  const teamNames = seedData.teams.map((team) => team.name)
  const triviaTitles = seedData.triviaCategories.map((category) => category.title)
  const hypeEventTitles = seedData.hypeEvents.map((event) => event.title)
  const hypeVoteKeys = seedData.hypeVotes.map((vote) => ({
    voterName: vote.voterName ?? null,
    suggestion: vote.suggestion ?? null,
  }))
  const sightingPhotoUrls = seedData.sightings.map((_, index) => getPhotoUrl(index))
  const powerUsageNotes = seedData.powerUsage
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

async function seedTeams(eventId, users, teamSeeds) {
  const createdTeams = []

  for (const team of teamSeeds) {
    createdTeams.push(await prisma.team.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        name: team.name,
        color: team.color,
      },
    }))
  }

  for (let index = 0; index < users.length; index += 1) {
    const team = createdTeams[index % createdTeams.length]
    await prisma.user.update({
      where: { id: users[index].id },
      data: { teamId: team.id },
    })
  }

  return createdTeams
}

async function seedSightings(eventId, adminUserId, now, sightings) {
  let pendingCount = 0
  let approvedCount = 0

  for (let index = 0; index < sightings.length; index += 1) {
    const template = sightings[index]
    const approved = template.approved !== false

    await prisma.publicSighting.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        photoUrl: getPhotoUrl(index),
        latitude: template.latitude,
        longitude: template.longitude,
        submitterName: template.submitterName ?? null,
        submitterCountry: template.submitterCountry ?? null,
        message: template.message ?? null,
        actionType: template.actionType,
        points: ACTION_POINTS[template.actionType],
        friendshipLevel: ACTION_FRIENDSHIP[template.actionType],
        status: approved ? 'approved' : 'pending',
        approvedAt: approved ? subtractHours(now, template.hoursAgo - 0.25) : null,
        approvedByUserId: approved ? adminUserId : null,
        adminNotes: approved ? null : template.adminNotes ?? null,
        createdAt: subtractHours(now, template.hoursAgo),
      },
    })

    if (approved) approvedCount += 1
    else pendingCount += 1
  }

  return {
    total: sightings.length,
    approvedCount,
    pendingCount,
  }
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

async function seedTrivia(eventId, users, now, triviaCategories, powerUsageSeeds) {
  const createdCategories = []
  const createdResults = []

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

    if (categorySeed.status === 'completed') {
      const q1Winner = users[categorySeed.winners[0]]?.id ?? null
      const q2Winner = users[categorySeed.winners[1]]?.id ?? null
      const q3Winner = users[categorySeed.winners[2]]?.id ?? null

      const result = calculateTriviaCategoryResult({
        q1Winner,
        q2Winner,
        q3Winner,
        hasNumericBonus: Boolean(categorySeed.hasNumericBonus),
      })

      createdResults.push(await prisma.triviaCategoryResult.create({
        data: {
          categoryId: category.id,
          question1Winner: q1Winner,
          question2Winner: q2Winner,
          question3Winner: q3Winner,
          scenario: result.scenario,
          categoryWinner: result.categoryWinner,
          basePoints: result.basePoints,
          numericBonus: result.numericBonus,
          finalPoints: result.finalPoints,
          publishedToScoreboard: Boolean(categorySeed.publishedToScoreboard),
          createdAt: subtractHours(now, 40 - categoryIndex * 3),
        },
      }))
    }
  }

  for (let index = 0; index < powerUsageSeeds.length; index += 1) {
    const seed = powerUsageSeeds[index]
    const category = createdCategories[index % createdCategories.length]
    await prisma.triviaPowerUsage.create({
      data: {
        eventId,
        seedTag: SEED_TAG,
        userId: users[seed.userIndex].id,
        powerType: seed.powerType,
        cost: seed.cost,
        categoryId: category?.id ?? null,
        targetUserId: seed.targetUserIndex !== undefined ? users[seed.targetUserIndex].id : null,
        note: seed.note ?? null,
        createdAt: subtractHours(now, 10 - index),
      },
    })
  }

  return {
    categoryCount: createdCategories.length,
    resultCount: createdResults.length,
    publishedResultCount: createdResults.filter((result) => result.publishedToScoreboard).length,
    powerUsageCount: powerUsageSeeds.length,
  }
}

async function main() {
  await ensureSeedSchema()

  const now = new Date()
  const seedData = await loadSeedData()
  const bachelorEvent = await getOrCreateBachelorEvent()

  await clearSeededBachelorData(bachelorEvent.id, seedData)

  const users = await ensureBachelorUsers(bachelorEvent.id)
  const teams = await seedTeams(bachelorEvent.id, users, seedData.teams)
  const sightings = await seedSightings(bachelorEvent.id, users[0]?.id ?? null, now, seedData.sightings)
  const hype = await seedHype(bachelorEvent.id, now, seedData.hypeVotes, seedData.hypeEvents)
  const trivia = await seedTrivia(bachelorEvent.id, users, now, seedData.triviaCategories, seedData.powerUsage)

  console.log(`Seed tag: ${SEED_TAG}`)
  console.log(`Seeded bachelor event: ${bachelorEvent.name} (${bachelorEvent.id})`)
  console.log(`Participants: ${users.length}`)
  console.log(`Teams: ${teams.length} (${teams.map((team) => team.name).join(', ')})`)
  console.log(`Sightings: ${sightings.total} total, ${sightings.approvedCount} approved, ${sightings.pendingCount} pending`)
  console.log(`Hype: ${hype.voteCount} votes, ${hype.eventCount} events`)
  console.log(`Trivia: ${trivia.categoryCount} categories, ${trivia.resultCount} results, ${trivia.publishedResultCount} published, ${trivia.powerUsageCount} power usages`)
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
