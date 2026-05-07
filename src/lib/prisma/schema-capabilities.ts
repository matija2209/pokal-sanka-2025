import 'server-only'

import { prisma } from '@/lib/prisma/client'

const globalForSchemaCapabilities = globalThis as unknown as {
  multiEventSchemaAvailable?: Promise<boolean>
}

async function detectMultiEventSchema(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'eventId'
      ) AS "exists"
    `

    return result[0]?.exists === true
  } catch (error) {
    console.error('Error checking multi-event schema availability:', error)
    return false
  }
}

export async function isMultiEventSchemaAvailable(): Promise<boolean> {
  if (!globalForSchemaCapabilities.multiEventSchemaAvailable) {
    globalForSchemaCapabilities.multiEventSchemaAvailable = detectMultiEventSchema()
  }

  return globalForSchemaCapabilities.multiEventSchemaAvailable
}

