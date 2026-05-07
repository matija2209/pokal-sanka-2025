# Scripts

This directory contains one-off and operational scripts for the app.

## Available Scripts

### `npm run seed:bachelor`

Runs [seed-bachelor-event.mjs](/home/matija/pokal-sanka-2025/scripts/seed-bachelor-event.mjs).

Purpose:
- bootstrap the `bachelor-party` event with demo data
- seed bachelor hype votes and hype events
- seed bachelor trivia categories and trivia questions

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
- `hype-votes.json`: public hype votes
- `hype-events.json`: hype event manager rows
- `trivia-categories.json`: trivia categories and question definitions

Legacy cleanup references:
- `teams.json`: old seeded team names used for cleanup-only matching
- `sightings.json`: old seeded sighting photo URLs used for cleanup-only matching
- `power-usage.json`: old seeded trivia power-usage notes used for cleanup-only matching

The seed script reads those files and inserts data into the `bachelor-party` event.

## Seed Tag / Cleanup Strategy

The bachelor seed uses a dedicated import marker:

```text
seedTag = "bachelor-bootstrap-v1"
```

This tag is written to these models:
- `TriviaCategory`
- `HypeVote`
- `HypeEvent`

This makes active seeded data easy to identify and remove without broad event-wide deletes.

Current cleanup behavior on each seed run:
- remove previously seeded bachelor teams with the same `seedTag`
- remove previously seeded bachelor trivia rows with the same `seedTag`
- remove previously seeded bachelor sightings, hype votes, hype events, and trivia power-usage rows with the same `seedTag`
- remove legacy v1 bachelor seed rows by matching the old stable content where needed, so older untagged demo rows do not block reruns

The same cleanup path can also be run directly without reseeding:

```bash
npm run drop:bachelor
```

Important:
- `TriviaCategoryResult` and `TriviaQuestion` do not have their own `seedTag`
- they are removed indirectly through tagged `TriviaCategory` rows
- the script no longer creates bachelor `User` rows or assigns teams
- the script no longer creates public sightings, trivia results, or trivia power usage

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
- recreates tagged hype votes and hype events
- recreates tagged trivia categories
- recreates trivia questions linked to those categories

The script prints a summary of:
- event id
- hype totals
- trivia category and question totals

## Editing Seed Data

To change bachelor demo content:
1. edit the relevant JSON file in `scripts/data/bachelor-event`
2. rerun `npm run seed:bachelor`

Recommended:
- keep hype event status, thresholds, and counts internally consistent
