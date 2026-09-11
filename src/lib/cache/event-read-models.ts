import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import {
  getAllTeams,
  getAllTeamsWithUsersAndDrinks,
  getAllPublishedResults,
  getAllTriviaResults,
  getAllUsersWithTeam,
  getAllUsersWithTeamAndDrinks,
  getApprovedSightings,
  getDrinkStatsByUser,
  getHypeEvents,
  getHypeVoteCount,
  getRecentCommentaries,
  getRecentDrinkLogs,
  getRecentDrinkLogsWithTeam,
  getRecentPosts,
  getRecentPostsWithImages,
  getRecentReels,
  getRecentTeamLogos,
  getRecentUserProfileImages,
  getPostsWithUsers,
  getUnreadCommentaries,
} from '@/lib/prisma/fetchers'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'

/** One tag invalidates every shared, event-scoped gameplay read model. */
export function eventReadTag(eventId: string): string {
  return `event-read:${eventId}`
}

export async function getEventRankingSnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [users, teams, triviaAvailable] = await Promise.all([
    getAllUsersWithTeamAndDrinks(eventId),
    getAllTeamsWithUsersAndDrinks(eventId),
    isTriviaAvailable(),
  ])
  const triviaResults = triviaAvailable ? await getAllTriviaResults(eventId) : []

  return { users, teams, triviaAvailable, triviaResults }
}

/**
 * Lean counterpart to getEventRankingSnapshot for /app/stats: fetches users/teams without
 * their full drinkLogs relation and gets per-user point/drink-type totals via a single
 * Postgres aggregate instead of loading every drink-log row (twice).
 */
export async function getEventLeaderboardSnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [users, teams, drinkStats, triviaAvailable] = await Promise.all([
    getAllUsersWithTeam(eventId),
    getAllTeams(eventId),
    getDrinkStatsByUser(eventId),
    isTriviaAvailable(),
  ])
  const triviaResults = triviaAvailable ? await getAllTriviaResults(eventId) : []

  return { users, teams, drinkStats, triviaAvailable, triviaResults }
}

export async function getEventFeedSnapshot(eventId: string, isBachelor: boolean) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [posts, commentaries, reels, sightings, hypeEvents, hypeVoteCount] = await Promise.all([
    getPostsWithUsers(24, eventId),
    getRecentCommentaries(30, eventId),
    getRecentReels(24, eventId),
    isBachelor ? getApprovedSightings(10, 0, eventId) : Promise.resolve([]),
    isBachelor ? getHypeEvents(eventId) : Promise.resolve([]),
    isBachelor ? getHypeVoteCount(eventId) : Promise.resolve(0),
  ])

  return { posts, commentaries, reels, sightings, hypeEvents, hypeVoteCount }
}

export async function getEventDashboardSnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [users, teams, recentDrinks, unreadCommentaries, recentImages, userProfiles, teamLogos, recentPosts, triviaAvailable] = await Promise.all([
    getAllUsersWithTeamAndDrinks(eventId),
    getAllTeams(eventId),
    getRecentDrinkLogsWithTeam(100, eventId),
    getUnreadCommentaries(50, eventId),
    getRecentPostsWithImages(15, eventId),
    getRecentUserProfileImages(5, eventId),
    getRecentTeamLogos(5, eventId),
    getRecentPosts(50, eventId),
    isTriviaAvailable(),
  ])
  const triviaResults = triviaAvailable ? await getAllTriviaResults(eventId) : []

  return {
    users,
    teams,
    recentDrinks,
    unreadCommentaries,
    recentImages,
    userProfiles,
    teamLogos,
    recentPosts,
    triviaAvailable,
    triviaResults,
  }
}

export async function getEventRosterOptions(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const users = await getAllUsersWithTeamAndDrinks(eventId)

  return { users }
}

/** Only used by /app/stats, which renders recentDrinks but not commentaries. */
export async function getEventActivitySnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const recentDrinks = await getRecentDrinkLogs(20, eventId)

  return { recentDrinks }
}

export async function getEventTriviaScoreboardSnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const triviaAvailable = await isTriviaAvailable()
  if (!triviaAvailable) {
    return { triviaAvailable, results: [], users: [] }
  }

  const [results, users] = await Promise.all([
    getAllPublishedResults(eventId),
    getAllUsersWithTeamAndDrinks(eventId),
  ])

  return { triviaAvailable, results, users }
}
