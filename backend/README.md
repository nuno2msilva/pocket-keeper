# Expense Tracker - Self-Hosted Backend

A complete Docker-based backend for the Expense Tracker with PostgreSQL, JWT authentication, and REST API sync.

## Quick Start

```bash
cd backend
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
```

## Features

- **Authentication**: JWT with refresh tokens, password reset
- **Data Sync**: Offline-first with last-write-wins conflict resolution
- **Community Database**: Opt-in product/merchant sharing (no prices shared)
- **Admin Panel**: User management (activate/deactivate, role assignment)
- **Security**: Rate limiting, helmet.js, bcrypt password hashing

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Create account
- `POST /login` - Get tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Revoke refresh token
- `POST /forgot-password` - Request reset
- `POST /reset-password` - Reset with token

### Users (`/api/users`)
- `GET /me` - Get profile
- `PATCH /me` - Update profile (including community opt-in)
- `POST /me/password` - Change password
- `DELETE /me` - Delete account

### Sync (`/api/sync`)
- `GET /status` - Sync status
- `POST /push` - Push local changes
- `GET /pull?since=` - Pull server changes
- `GET /full` - Full data download

### Community (`/api/community`)
- `GET /products?q=&barcode=` - Search community products
- `GET /merchants?q=&nif=` - Search community merchants
- `POST /sync-contributions` - Share solidified items
- `POST /pull` - Get community suggestions

### Admin (`/api/admin`)
- `GET /users` - List users
- `GET /users/:id` - User details
- `PATCH /users/:id/status` - Activate/deactivate
- `PATCH /users/:id/role` - Assign roles
- `GET /stats` - System statistics

## Environment Variables

See `.env.example` for all options.

## Remaining Frontend Tasks

The backend is ready. To complete the integration:

1. **Dark Mode**: Add theme toggle to settings (system preference + manual)
2. **Auth UI**: Login, register, forgot password pages
3. **Sync Service**: Connect to API with offline queue
4. **Admin Panel**: User management UI for admins
5. **Testing**: Vitest for unit tests, Playwright for E2E
