# Backend API

Requires Node.js and Docker with Docker Compose for the local PostgreSQL database.

Run from this directory:

```sh
cp .env.example .env # First setup only; preserve an existing .env
npm install
npm run db:setup
npm run dev
```

The local database matches the example `DATABASE_URL`:
`postgresql://postgres:postgres@localhost:5432/digital_surveyor`.
These credentials are for local development only. Set a private `JWT_SECRET` in `.env`.
For an externally managed database, set `DATABASE_URL` to its connection URL and
run `npm run prisma:generate` and `npm run db:deploy` instead of `db:setup`.

PostgreSQL data persists in a Docker volume across restarts. Use `npm run db:stop`
to stop it and `npm run db:up` to start it again. Do not run `docker compose down -v`
unless you intend to delete all local database data.

`ECONNREFUSED` from `prisma.user.findUnique()` means the configured database is
not accepting connections. For this local setup, run `npm run db:up` and
`npm run db:deploy`. Check database status with `docker compose ps`.
