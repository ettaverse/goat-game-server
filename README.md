# Goat Game Server

Autobattler backend server for the Goat Game, deployed on AWS App Runner via CDK.

## Project Structure

```
├── src/                  # Server source code (TypeScript)
│   ├── server.ts         # Express server entry point
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── engine/           # Battle engine (units, turns, abilities)
│   ├── data/             # Card and ability definitions
│   ├── constants/        # Game constants
│   └── utils/            # Validation and error handling
├── tests/                # Jest tests
├── infra/                # AWS CDK infrastructure
│   ├── bin/app.ts        # CDK app entry point
│   └── lib/              # CDK stack definitions
├── Dockerfile            # Multi-stage Docker build
├── package.json          # Server dependencies
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
npm install
npm run dev       # Run with ts-node
npm test          # Run tests
npm run build     # Compile TypeScript
npm start         # Run compiled output
```

## Deploy to AWS

### Prerequisites
- AWS CLI configured with credentials
- AWS CDK installed (`npm install -g aws-cdk`)
- CDK bootstrapped in your account (`cdk bootstrap`)

### Deploy

```bash
cd infra
npm install
npx cdk deploy
```

### Tear Down

```bash
cd infra
npx cdk destroy
```
