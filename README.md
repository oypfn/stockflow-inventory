# StockFlow

A modern inventory workspace for small businesses. StockFlow is being developed as a portfolio-grade full-stack application with a focus on reliable stock operations, clear reporting and maintainable engineering.

## Current status

**Milestone 1 — interactive frontend foundation.** The current app includes a responsive inventory dashboard, product creation and deletion, stock adjustments, low-stock alerts, search/filtering, CSV export and browser-local persistence.

> This milestone is a frontend demonstration. Data is stored in the current browser only. There is no authentication, shared database, server API, cloud backup or multi-user access yet. Demo records are illustrative.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Planned architecture

- **Frontend:** React, TypeScript, Vite
- **API:** Node.js, TypeScript and REST
- **Database:** PostgreSQL with migrations
- **Validation:** shared schemas and server-side validation
- **Security:** authentication, role-based access, rate limiting and audit trail
- **Operations:** automated tests, CI, structured logging and deployment documentation

## Roadmap

- [x] Responsive inventory dashboard and local product workflows
- [x] Low-stock rules, search, filtering and CSV export
- [x] Domain validation helpers and unit tests
- [ ] API and PostgreSQL persistence
- [ ] Authentication and workspace roles
- [ ] Suppliers, purchase orders and stock movement ledger
- [ ] Reporting, audit history and data import
- [ ] End-to-end tests and deployment hardening

## License

No license has been selected yet. All rights remain with the repository owner until a license is added.