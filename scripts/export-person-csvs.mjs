import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function csvEscape(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n')
}

function sanitizeFilePart(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function resolveBaseUrl() {
  const baseUrl = process.argv[2]
    || process.env.INVITE_BASE_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || 'http://localhost:3000'

  return trimTrailingSlash(baseUrl)
}

function buildInviteUrl(baseUrl, eventSlug, personId) {
  return `${baseUrl}/invite/${eventSlug}/${personId}`
}

async function main() {
  const baseUrl = resolveBaseUrl()
  const outputDirArg = process.argv[3]
  const outputDir = path.resolve(process.cwd(), outputDirArg ?? 'exports/person-invites')

  await mkdir(outputDir, { recursive: true })

  const [events, persons, legacyUsersWithoutPerson] = await Promise.all([
    prisma.event.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { createdAt: 'asc' },
        { name: 'asc' },
      ],
    }),
    prisma.person.findMany({
      include: {
        users: {
          include: {
            team: true,
            event: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.user.findMany({
      where: {
        personId: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  const summaryRows = [[
    'eventId',
    'eventSlug',
    'eventName',
    'fileName',
    'personCount',
  ]]

  for (const event of events) {
    const rows = [[
      'personId',
      'personName',
      'eventId',
      'eventSlug',
      'eventName',
      'hasUserForEvent',
      'userId',
      'userName',
      'teamId',
      'teamName',
      'invitePath',
      'inviteUrl',
    ]]

    for (const person of persons) {
      const eventUser = person.users.find((user) => user.eventId === event.id) ?? null
      const invitePath = `/invite/${event.slug}/${person.id}`

      rows.push([
        person.id,
        person.name,
        event.id,
        event.slug,
        event.name,
        eventUser ? 'yes' : 'no',
        eventUser?.id ?? '',
        eventUser?.name ?? '',
        eventUser?.teamId ?? '',
        eventUser?.team?.name ?? '',
        invitePath,
        buildInviteUrl(baseUrl, event.slug, person.id),
      ])
    }

    const safeEventSlug = sanitizeFilePart(event.slug) || event.id
    const fileName = `${safeEventSlug}.csv`

    await writeFile(
      path.join(outputDir, fileName),
      `${toCsv(rows)}\n`,
      'utf8',
    )

    summaryRows.push([
      event.id,
      event.slug,
      event.name,
      fileName,
      persons.length,
    ])
  }

  await writeFile(
    path.join(outputDir, '_index.csv'),
    `${toCsv(summaryRows)}\n`,
    'utf8',
  )

  if (legacyUsersWithoutPerson.length > 0) {
    const legacyRows = [[
      'userId',
      'userName',
      'note',
    ]]

    for (const user of legacyUsersWithoutPerson) {
      legacyRows.push([
        user.id,
        user.name,
        'Skipped because this user has no personId, so an invite URL cannot target them.',
      ])
    }

    await writeFile(
      path.join(outputDir, '_legacy-users-without-person.csv'),
      `${toCsv(legacyRows)}\n`,
      'utf8',
    )
  }

  console.log(`Exported invite CSVs for ${events.length} events and ${persons.length} persons to ${outputDir}`)
}

main()
  .catch((error) => {
    console.error('Failed to export invite CSV files')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
