# Goat Game Server

Autobattler backend server for the Goat Game, built with **Bun + Elysia** and deployed on AWS App Runner via CDK.

## Project Structure

```
├── src/                  # Server source code (TypeScript)
│   ├── server.ts         # Elysia server entry point
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── engine/           # Battle engine (units, turns, abilities)
│   ├── data/             # Card and ability definitions
│   ├── constants/        # Game constants
│   └── utils/            # Validation and error handling
├── tests/                # Bun tests
├── infra/                # AWS CDK infrastructure
│   ├── bin/app.ts        # CDK app entry point
│   └── lib/              # CDK stack definitions
├── Dockerfile            # Bun Docker image
├── docker-compose.yml    # Local Docker development
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## API Endpoints

| Method | Path      | Description                     |
|--------|-----------|---------------------------------|
| GET    | /health   | Health check (App Runner)       |
| GET    | /cards    | Get all standard cards          |
| GET    | /heroes   | Get all hero cards              |
| POST   | /match    | Simulate a battle between teams |

## Local Development

```bash
bun install
bun run dev       # Run with --watch
bun test          # Run tests
bun run start     # Run server
```

### Docker

```bash
docker compose up --build      # Build and run
docker compose up --build -d   # Run in background
docker compose down             # Stop
docker compose logs -f          # Tail logs
```

## Deploy to AWS

### Prerequisites
- AWS CLI configured (`--profile etta`)
- AWS CDK installed (`npm install -g aws-cdk`)
- Docker running (for image build + push to ECR)
- CDK bootstrapped (`cd infra && npx cdk bootstrap --profile etta`)

### Deploy

```bash
cd infra
npm install
npx cdk deploy --profile etta
```

### Tear Down

```bash
cd infra
npx cdk destroy --profile etta
```
