# Scripts

This directory contains one-off and operational scripts for the app.

## Available Scripts

### `npm run seed:bachelor`

Runs [seed-bachelor-event.mjs](/home/matija/pokal-sanka-2025/scripts/seed-bachelor-event.mjs).

Purpose:
- bootstrap the `bachelor-party` event with demo data
- create missing bachelor `User` participants from existing `Person` rows
- seed bachelor teams, public sightings, hype votes, hype events, trivia categories, trivia results, and trivia power usage

Prerequisites:
- `DATABASE_URL` configured
- Prisma migrations applied
- the seed-tag migration applied (`20260508110000_add_seed_tags`)
- trivia tables available

Command:

```bash
npm run seed:bachelor
```

### `npm run drop:bachelor`

Runs [seed-bachelor-event.mjs](/home/matija/pokal-sanka-2025/scripts/seed-bachelor-event.mjs) in cleanup-only mode.

Purpose:
- drop bachelor bootstrap data previously inserted by the seed flow
- keep the `bachelor-party` event row intact
- keep bachelor `User` participants intact

Command:

```bash
npm run drop:bachelor
```

### `npm run export:person-csv`

Runs [export-person-csvs.mjs](/home/matija/pokal-sanka-2025/scripts/export-person-csvs.mjs).

Purpose:
- export invite CSV files for all active events
- generate `/invite/[eventSlug]/[personId]` URLs for every `Person`

Command:

```bash
npm run export:person-csv
```

Optional arguments:

```bash
node scripts/export-person-csvs.mjs [baseUrl] [outputDir]
```

## Bachelor Seed Data

The bachelor seed is data-driven. Seed content lives in JSON files under:

```text
scripts/data/bachelor-event/
```

Files:
- `teams.json`: bachelor team names and colors
- `sightings.json`: public sighting submissions
- `hype-votes.json`: public hype votes
- `hype-events.json`: hype event manager rows
- `trivia-categories.json`: trivia categories, questions, and completed-result definitions
- `power-usage.json`: trivia power usage rows

The seed script reads those files and inserts data into the `bachelor-party` event.

## Seed Tag / Cleanup Strategy

The bachelor seed uses a dedicated import marker:

```text
seedTag = "bachelor-bootstrap-v1"
```

This tag is written to these models:
- `Team`
- `TriviaCategory`
- `TriviaPowerUsage`
- `PublicSighting`
- `HypeVote`
- `HypeEvent`

This makes seeded data easy to identify and remove without broad event-wide deletes.

Current cleanup behavior on each seed run:
- remove previously seeded bachelor teams with the same `seedTag`
- remove previously seeded bachelor trivia rows with the same `seedTag`
- remove previously seeded bachelor sightings, hype votes, and hype events with the same `seedTag`
- remove legacy v1 bachelor seed rows by matching the old stable content where needed, so older untagged demo rows do not block reruns

The same cleanup path can also be run directly without reseeding:

```bash
npm run drop:bachelor
```

Important:
- `TriviaCategoryResult` and `TriviaQuestion` do not have their own `seedTag`
- they are removed indirectly through tagged `TriviaCategory` rows
- bachelor `User` rows are not tagged and are not deleted by the seed
- the script upserts missing `User` rows for existing `Person` rows in the bachelor event

## Schema Notes

The JSON-driven bachelor seed depends on nullable `seedTag` columns added in:

```text
prisma/migrations/20260508110000_add_seed_tags/migration.sql
```

Models updated by that migration:
- `teams`
- `trivia_categories`
- `trivia_power_usage`
- `public_sightings`
- `hype_votes`
- `hype_events`

If `npm run seed:bachelor` fails with a missing seed-tag or trivia-table error, run:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Bachelor Seed Behavior

When the bachelor seed runs successfully, it:
- resolves or creates the `bachelor-party` event
- loads JSON seed data from `scripts/data/bachelor-event`
- ensures every existing `Person` has a `User` in the bachelor event
- recreates the seeded team set and reassigns bachelor participants across those teams
- recreates tagged bachelor sightings
- recreates tagged hype votes and hype events
- recreates tagged trivia categories and trivia power usage
- recreates trivia questions and trivia category results linked to those categories

The script prints a summary of:
- event id
- participant count
- team count
- sighting totals
- hype totals
- trivia totals

## Editing Seed Data

To change bachelor demo content:
1. edit the relevant JSON file in `scripts/data/bachelor-event`
2. rerun `npm run seed:bachelor`

Recommended:
- keep trivia `winners` arrays aligned with the sorted bachelor user list used by the script
- keep `actionType` values in `sightings.json` consistent with bachelor action types used by the app
- keep hype event status, thresholds, and counts internally consistent

## Images

Seeded bachelor sightings currently use a local static image path:

```text
/logo.jpg
```

This avoids external placeholder image dependencies such as `placehold.co`.
