# QVault

QVault is an online zero-knowledge vault. Passwords, notes, TOTP secrets,
crypto keys, and recovery codes are encrypted in the browser before they are
sent to the server. The hosted database stores ciphertext and the metadata
required to operate the account.

## Features

- Accounts with a username and a verified email address (legacy identifiers still sign in)
- Email confirmation link required before the first sign-in
- AES-256-GCM encryption with a PBKDF2-derived key
- Passwords, links, encrypted notes, TOTP, crypto secrets, and recovery codes
- Multiple vaults, folders, tags, favorites, search, and item history
- Encrypted `.qvault` backup import/export
- Password strength and reuse audit performed in the browser
- Revocable browser-extension token
- Voluntary Support page for disclosed sponsors and affiliate links
- French and English interface

## Stack

- Nuxt 3, Vue 3, Tailwind CSS
- Turso/libSQL in production
- Vercel Nitro preset
- `nuxt-auth-utils` encrypted session cookies

## Local development

Install dependencies and start Nuxt:

```bash
bun install
bun run dev
```

Without `TURSO_DB_URL`, development uses `qvault-dev.db` in the project root.
The file is ignored by Git.

Copy `.env.example` to `.env` and set a session password of at least 32
characters:

```dotenv
NUXT_SESSION_PASSWORD=replace-with-a-long-random-secret
TURSO_DB_URL=libsql://your-database.turso.io
TURSO_DB_TOKEN=your-token
APP_URL=http://localhost:3000
# Transactional email (Resend). Without a key, emails are logged instead.
RESEND_API_KEY=re_your_key
RESEND_FROM=QVault <noreply@your-verified-domain.com>
# Optional: set [] to hide the public partner catalogue.
SUPPORT_CATALOG_JSON=[]
```

## Support catalog

The Support page includes the disclosed PokePings partner offers. Configure a
different catalogue privately through `SUPPORT_CATALOG_JSON`, or set it to
`[]` to hide all partner links. The client never receives the environment
variable itself, only validated entries from `/api/support/catalog`.

```json
[
  {
    "id": "partner-id",
    "kind": "affiliate",
    "title": "Partner name",
    "description": "What the visitor will find after opening the link.",
    "url": "https://partner.example/path",
    "disclosure": "Affiliate link — QVault may receive a commission."
  }
]
```

Only HTTPS destinations are accepted. Links open after an explicit user action
with `rel="sponsored noopener noreferrer"`. No advertising SDK or third-party
analytics script is loaded inside the vault.

## Database

Create or update the Turso schema:

```bash
bun run db:migrate
```

The runtime also performs idempotent compatibility migrations. Existing hosted
accounts keep their original email identifier for sign-in while receiving a
unique username, and are treated as verified. New accounts require a valid
email address: the account stays inactive until the single-use confirmation
link (valid 24 hours) is opened.

## Email verification

Registration sends a confirmation email through Resend. Configure:

- `RESEND_API_KEY` — a Resend API key (`re_…`).
- `RESEND_FROM` — a sender on a domain verified in Resend, for example
  `QVault <noreply@qvault.hqmerchant.xyz>`.
- `APP_URL` — used to build the confirmation link, so it must be the public
  origin in production.

When `RESEND_API_KEY` is empty, messages are written to the server log instead
of being sent, and the registration response includes a `devVerificationUrl`
outside production so the flow can be tested locally.

## Validation

```bash
bun run test
bun run build
```

For the API smoke test, start the app first and run:

```bash
bun run test:smoke
```

## Deployment

Set `NUXT_SESSION_PASSWORD`, `TURSO_DB_URL`, `TURSO_DB_TOKEN`, `APP_URL`,
`RESEND_API_KEY`, and `RESEND_FROM` in Vercel, then deploy.
`SUPPORT_CATALOG_JSON` is optional.

## License

[MIT](./LICENSE.md) — HQ Studio by Enzo.
