# HealthBridge Backend

## Run locally

1. Install Node.js.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm start
```

The API will run on:

http://localhost:5000

Test:

http://localhost:5000/api/health

## Main APIs

GET /api/hospitals
GET /api/hospitals/:id
POST /api/tokens
GET /api/tokens

This starter backend stores tokens in memory. Restarting the server clears the tokens. A production version can replace this with MongoDB/PostgreSQL.
