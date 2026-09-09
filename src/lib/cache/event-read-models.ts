import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import {
  getAllTeams,
  getAllTeamsWithUsersAndDrinks,
  getAllPublishedResults,
  getAllTriviaResults,
  getAllUsersWithTeamAndDrinks,
  getApprovedSightings,
  getHypeEvents,
  getHypeVoteCount,
  getRecentCommentaries,
  getRecentDrinkLogs,
  getRecentDrinkLogsWithTeam,
  getRecentPosts,
  getRecentPostsWithImages,
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

export async function getEventFeedSnapshot(eventId: string, isBachelor: boolean) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [posts, commentaries, imagePosts, sightings, hypeEvents, hypeVoteCount] = await Promise.all([
    getPostsWithUsers(24, eventId),
    getRecentCommentaries(30, eventId),
    getRecentPostsWithImages(10, eventId),
    isBachelor ? getApprovedSightings(10, 0, eventId) : Promise.resolve([]),
    isBachelor ? getHypeEvents(eventId) : Promise.resolve([]),
    isBachelor ? getHypeVoteCount(eventId) : Promise.resolve(0),
  ])

  return { posts, commentaries, imagePosts, sightings, hypeEvents, hypeVoteCount }
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
    getRecentPostsWithImages(5, eventId),
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

export async function getEventActivitySnapshot(eventId: string) {
  'use cache: remote'

  cacheLife('eventLive')
  cacheTag(eventReadTag(eventId))

  const [recentDrinks, recentCommentaries] = await Promise.all([
    getRecentDrinkLogs(20, eventId),
    getRecentCommentaries(15, eventId),
  ])

  return { recentDrinks, recentCommentaries }
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
