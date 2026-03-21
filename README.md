# MediPraxis Monorepo

Built with a monorepo architecture using Turborepo in Yarn workspaces. This project includes a mobile app(practitioner-facing), a web application(the patient-facing), the backend API, an AI service, and shared packages used across those apps.

## Project Structure

```text
medipraxis-monorepo/
├── apps/
│   ├── ai-engine/          # AI service for assistant workflows and routing
│   ├── api/                # Backend API (Hono - Cloudflare Workers)
│   ├── mobile-app/         # React Native mobile app (Expo)
│   └── web-app/            # Web application (React + Vite)
├── packages/
│   ├── api-client/         # Shared typed API client
│   ├── config/             # Shared design tokens and style constants
│   ├── eslint-config/      # Shared ESLint configurations
│   ├── models/             # Shared schemas, models, and AI contracts
|   └── typescript-config/  # Shared TypeScript configurations
├── package.json
├── turbo.json
└── yarn.lock
```

### Applications

- **`mobile-app`**: Expo + React Native mobile application with authentication, client management, scheduling, reports, and an AI assistant experience.
- **`web-app`**: React + Vite web application with OTP-based flows, client registration, scheduling, and report upload/request workflows.
- **`api`**: Hono API running on Cloudflare Workers for auth, tasks, clients, reports, forms, appointments, shareable calendar links, OTP, user keys, and AI integration.
- **`ai-engine`**: Express-based AI service built with Genkit and Google GenAI for routing and handling assistant workflows.

### Shared Packages

- **`packages/api-client`**: Typed API client used by frontend and service apps.
- **`packages/models`**: Zod schemas, domain models, and AI-related types/router contracts.
- **`packages/config`**: Design tokens and style constants.
- **`@repo/eslint-config`**: ESLint configurations for consistent code style.
- **`@repo/typescript-config`**: TypeScript configurations for type safety

## Tech Stack

- **Yarn workspaces**: Monorepo dependency and workspace management
- **Turborepo**: Monorepo build system
- **TypeScript**: Static type checking
- **React 19**: UI framework
- **Expo**: Mobile app development platform
- **React Native**: Native mobile UI framework used with Expo
- **Vite**: Fast web build tool
- **Hono**: Lightweight web framework
- **Cloudflare Workers**: Serverless API platform
- **Genkit**: Workflow orchestration for the AI service
- **Google GenAI**: Model provider used by the AI engine
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing for the web app
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Getting Started

### Prerequisites

- Node.js 18 or newer
- Yarn 1.22.22

### Install Dependencies

```bash
# Install dependencies
yarn install
```

### Development

```bash
yarn dev
```

This uses Turborepo to run each workspace `dev` script in parallel.

### Run A Single App

```bash
yarn dev --filter=mobile-app
yarn dev --filter=web-app
yarn dev --filter=api
yarn dev --filter=ai-engine
```

## Workspace Commands

### From The Repository Root

```bash
yarn dev
yarn build
yarn lint
yarn format
yarn format:check
```

### App-Specific Commands

```bash
# API
yarn workspace api dev
yarn workspace api test
yarn workspace api deploy

# Web app
yarn workspace web-app dev
yarn workspace web-app test
yarn workspace web-app test:e2e

# Mobile app
yarn workspace mobile-app dev
yarn workspace mobile-app android
yarn workspace mobile-app ios
yarn workspace mobile-app test

# AI engine
yarn workspace ai-engine dev
yarn workspace ai-engine build
```

## Environment Setup

The repo uses different environment variables per application.

### Web App

`apps/web-app` reads:

- `VITE_API_BASE_URL`
- `VITE_API_URL`

If `VITE_API_BASE_URL` is not set, the web app falls back to `http://localhost:8787`.

### Mobile App

`apps/mobile-app` reads:

- `EXPO_PUBLIC_API_BASE_URL`

This value is required by `apps/mobile-app/lib/api-client.ts`.

### API

`apps/api` expects Cloudflare Worker bindings for:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `AI_ENGINE_URL`
- `AI_ENGINE_API_KEY`
- `TEXT_LK_API_KEY`
- `TEXT_LK_API_URL`
- `MEDIPRAXIS_WEB_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `IS_DEV` (optional)

Configure these in your Worker environment before running or deploying the API.

### AI Engine

`apps/ai-engine/.env.example` includes:

- `GOOGLE_GENAI_API_KEY`
- `AI_ENGINE_API_KEY`
- `API_BASE_URL`

Copy that file into a local `.env` setup before starting the AI engine.

## Testing

- `apps/api` uses Jest for backend flow and integration-style tests.
- `apps/web-app` uses Jest for component/unit coverage and Playwright for end-to-end coverage.
- `apps/mobile-app` uses Jest for React Native tests.

Examples:

```bash
yarn workspace api test
yarn workspace web-app test
yarn workspace web-app test:e2e
yarn workspace mobile-app test
```

## Notes For Contributors

- The repository uses Husky via the root `prepare` script.
- The mobile app is configured with Expo Router.
- The API is served from Cloudflare Workers through Wrangler.
- The AI engine exposes an authenticated `/api/ai/query` endpoint consumed by the API layer.

## Commit Conventions

Use the following conventions when writing commit messages for this project:

- **`feat`** - general features
- **`fix`** - general fixes
- **`doc`** - documentational changes
- **`style`** - style related changes
- **`refactor`** - coding moving, and other refactoring that are not features or fixes
- **`chore`** - little changes that are not features or fixes
