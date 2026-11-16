# CalTrack

CalTrack is an offline-first calorie tracking app built with Ionic and Angular. Log meals throughout the day, track your daily calorie goal and macros, browse your history, and review nutrition insights. Entries are stored locally and sync with a small Express REST API whenever a server is reachable.

## Features

- Daily dashboard with calorie goal, remaining calories, and macro totals
- Meal logging for breakfast, lunch, dinner, and snacks
- Per-meal calorie targets, macro breakdown, and one-tap add
- Searchable, categorized food catalog with quick-add presets
- Edit and delete existing entries
- Optional meal photos using the device camera
- Protein, carb, and fat goals with daily progress bars
- Daily water intake tracking with quick-add controls
- History view with daily summaries
- Insights with average intake and macro breakdown over 7 or 30 days
- Offline-first storage with a pending queue that syncs when the API is reachable
- Configurable daily goal, macro goals, water goal, API base URL, and haptics
- Native Android build via Capacitor

## Tech stack

- Ionic 9 + Angular 22 (standalone components, signals)
- Capacitor 8 (Android)
- Express 4 REST API with JSON file persistence
- Vitest for unit tests, Playwright for end-to-end tests
- ESLint and Prettier

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run server:install
```

Start the API in one terminal:

```bash
npm run server
```

Start the Ionic dev server in another:

```bash
npm start
```

Open the app at the URL printed by `npm start` (usually `http://localhost:4200`).

The app defaults to `http://localhost:3000/api` in the browser and `http://10.0.2.2:3000/api` on the Android emulator. Both can be changed in Settings.

## Android

Build the web assets and sync them into the native project:

```bash
npm run cap:sync
```

Open the project in Android Studio:

```bash
npm run android
```

Run the app on an emulator or device from Android Studio. The camera feature requires the `CAMERA` permission to be granted at runtime.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Serve the app in development |
| `npm run build` | Production build to `www/` |
| `npm run watch` | Build in watch mode (development) |
| `npm run lint` | Run ESLint, e2e typecheck, and Prettier check |
| `npm run lint:fix` | Auto-fix lint and formatting issues |
| `npm run test` | Run unit and e2e tests |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright tests |
| `npm run server` | Start the REST API |
| `npm run server:dev` | Start the API with file watching |
| `npm run cap:sync` | Build and sync web assets to Android |
| `npm run android` | Open the Android project in Android Studio |

## API

The server stores data in `server/data/entries.json` (ignored by git) and listens on port `3000` by default, configurable with the `PORT` environment variable.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/entries` | List entries, filter by `meal`, `date`, `from`, or `to` |
| `GET` | `/api/summary` | Daily totals, optionally for a `date` |
| `GET` | `/api/entries/:id` | Fetch a single entry |
| `POST` | `/api/entries` | Create an entry |
| `PUT` | `/api/entries/:id` | Update an entry |
| `DELETE` | `/api/entries/:id` | Delete an entry |

## Project structure

```text
src/app/
  components/entry-form/   Meal entry form
  core/models/             Shared models and meal definitions
  core/services/           API, storage, settings, camera, and sync services
  core/utils/              Date helpers and insight calculations
  home/                    Daily dashboard
  history/                 Entry history
  settings/                App settings
server/src/index.js        Express REST API
e2e/                       Playwright end-to-end tests
```

## Configuration

Settings are stored locally on the device and can be changed from the Settings tab:

- Daily calorie goal
- Protein, carb, and fat goals
- Daily water goal
- API base URL
- Haptic feedback on or off

## Testing

```bash
npm run test:unit
npm run test:e2e
```

End-to-end tests expect the app and API to be running. See `playwright.config.ts` for the configured base URL and web server setup.

## License

This project is for personal use. Add a license if you plan to distribute it.
