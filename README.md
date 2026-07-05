# FormForge — Build Beautiful Forms

**FormForge** is a full-stack form-builder SaaS that lets you create, share, and analyze forms with drag-and-drop editing, theme customization, analytics, payment gating, webhooks, email notifications, and multi-page support.

Built as a **Turborepo monorepo** with pnpm workspaces — an Express API backend paired with a Next.js (App Router) frontend.

---

## Table of Contents

- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Pricing](#pricing)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Screenshots

<!-- TODO: Add screenshots of the landing page, form editor, analytics dashboard, and public form view -->

---

## Architecture

```
Browser ──► Next.js (port 3000)
                │
                ├── tRPC (HTTP POST /trpc) ──► Express (port 8000) ──► PostgreSQL
                │                                  │
                └── /api/auth/* ───────────────────► better-auth handler ──► PostgreSQL
```

- **Monorepo manager:** pnpm 9.x
- **Task orchestrator:** Turborepo 2.x
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** better-auth (email/password + Google/GitHub OAuth)
- **API protocol:** tRPC (native) + OpenAPI REST (auto-generated)
- **Payments:** Razorpay subscriptions
- **File storage:** Cloudinary
- **Email:** Nodemailer via SMTP (console in dev)

---

## Tech Stack

### Frontend (`apps/web`)
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework |
| React 19 | UI library |
| TypeScript 5.9 | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui + Radix Primitives | Accessible UI components (52+) |
| @dnd-kit | Drag-and-drop |
| tRPC React Query | Typed API client |
| Zustand | Client state management |
| better-auth/client | Authentication |
| Recharts | Analytics charts |
| Lenis | Smooth scrolling |
| Sonner | Toast notifications |
| React Hook Form + Zod | Form validation |
| next-themes | Dark/light mode |
| Zustand | Form editor state |
| Razorpay Checkout | Payment UI |
| QRCode.react | QR code generation |

### Backend (`apps/api`)
| Technology | Purpose |
|---|---|
| Express 5 | HTTP server |
| tRPC 11 | End-to-end typesafe APIs |
| trpc-to-openapi | OpenAPI spec generation |
| @scalar/express-api-reference | API documentation UI |
| Multer | File upload handling |
| Cloudinary SDK | Cloud file storage |
| better-auth | Authentication |
| Helmet | Security headers |
| csurf | CSRF protection |
| express-rate-limit | Rate limiting |
| cors | Cross-origin requests |

### Packages
| Package | Purpose |
|---|---|
| `@repo/database` | Drizzle ORM schema, migrations, Zod schemas |
| `@repo/services` | Business logic (form, field, submission, webhook, email, auth, folders, templates) |
| `@repo/trpc` | tRPC server routers + client types |
| `@repo/logger` | Winston logger |
| `@repo/eslint-config` | Shared ESLint configuration |
| `@repo/typescript-config` | Shared TypeScript configuration |

---

## Key Features

### Form Builder
- **Drag-and-drop editor** — Reorder fields, add from palette, configure in right panel
- **16 field types:** Text, Email, Number, Yes/No, Password, Select, Multi-Select, Date, Time, Rating (1-5 stars), Tags, Toggle, Radio, Checkbox, Textarea, File Upload
- **Multi-page forms** — Add/remove pages, navigate between them
- **Conditional logic** — Show/hide fields based on previous answers
- **Field validation** — Required, min/max, regex pattern
- **Field duplication** — Clone existing fields

### Themes & Styling
- **8 preset themes** — Default, Midnight, Forest, Ocean, Sunset, Lavender, Mint, Rose
- **Custom theme editor** — Font family, color palette, border radius
- **Cover images** — Upload form cover images via Cloudinary
- **Show/hide field icons** — Toggle icon display on form fields

### Analytics
- **Dashboard metrics** — Total views, starts, submissions (current + previous period)
- **Daily breakdown** — Line chart of submissions over last 30 days
- **Field-level analytics** — Per-field response breakdown (individual field data)
- **Submission rate** — Views → Start → Submit funnel

### Submissions
- **Paginated list** — Search by respondent email, sort by date
- **Response detail drawer** — Slide-in panel with full submission data
- **CSV export** — Download all submissions as CSV
- **Delete submissions**
- **Public submission view** — Optional public-facing submissions page

### Email Notifications
- **Creator notifications** — Email on every new submission (customizable subject + template)
- **Respondent confirmation** — Auto-reply to respondents (uses form field for email)
- **Weekly digest** — Weekly summary of form activity
- **Powered by Nodemailer** — SMTP configuration (Resend recommended)

### Webhooks
- **CRUD management** — Create, update, list, delete webhooks per form
- **Event-based** — Triggered on `submission.created`
- **Fire-and-forget** — POST requests to configured URLs

### Payment Gating (Pro/Enterprise)
- **Razorpay subscriptions** — Monthly/yearly billing
- **Plan enforcement** — Feature gating (ProGate component)
- **Webhook verification** — HMAC-SHA256 signature validation
- **Subscription lifecycle** — Active, cancelled, expired status tracking

### Sharing & Access Control
- **Visibility modes:** Public, Unlisted, Private
- **Password protection** — bcrypt-hashed form passwords
- **QR code sharing** — Built-in QR code for form URL
- **Share modal** — Copy URL with one click
- **Unique slugs** — Human-readable, nanoid-generated fallback

### Templates
- **Create templates** — Save any form as a reusable template
- **Create from template** — Instantiate new forms from templates
- **Template management** — List and delete saved templates

### Folders
- **Organize forms** — Create, rename, delete folders
- **Move forms** — Drag forms between folders or via action
- **Folder filter** — Filter forms by folder

### UX
- **Command palette** — Cmd+K global search and navigation
- **Keyboard shortcuts** — Quick actions throughout
- **Responsive design** — Mobile-friendly sidebar with sheet mode
- **Dark/light mode** — System preference aware
- **Skip-to-content** — Accessibility link
- **Smooth scroll** — Lenis-powered landing page animations

---

## Pricing

| Feature | Free | Pro | Enterprise |
|---|---|---|---|
| **Forms** | 10 | 50 | Unlimited |
| **Submissions** | Unlimited | Unlimited | Unlimited |
| **Field types** | All 16 | All 16 | All 16 |
| **Multi-page forms** | ✅ | ✅ | ✅ |
| **Conditional logic** | ✅ | ✅ | ✅ |
| **Password protection** | ✅ | ✅ | ✅ |
| **CSV export** | ✅ | ✅ | ✅ |
| **Email notifications** | ✅ | ✅ | ✅ |
| **Templates** | ✅ | ✅ | ✅ |
| **Folders** | ✅ | ✅ | ✅ |
| **Custom themes** | — | ✅ | ✅ |
| **Analytics** | — | ✅ | ✅ |
| **Webhooks** | — | ✅ | ✅ |
| **Payment gating** | — | ✅ | ✅ |
| **File uploads** | — | ✅ | ✅ |
| **Priority support** | — | — | ✅ |
| **Price** | Free | ₹999/mo | Custom |

---

## API Endpoints

### Health & Info
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | API status check |
| GET | `/health` | Public | Health check with `healthy: true` |
| GET | `/openapi.json` | Public | Auto-generated OpenAPI spec |
| GET | `/docs` | Public | Scalar API documentation UI |

### Authentication (Proxy to better-auth)
| Method | Path | Auth | Description |
|---|---|---|---|
| ANY | `/api/auth/*` | Varies | Sign in, sign up, session, email verification, password reset, OAuth |

### File Upload
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Session required | Upload file to Cloudinary (image, PDF, Word, CSV, ZIP, RAR; 10MB limit) |

### Webhooks (Incoming)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/webhooks/razorpay` | HMAC signature | Razorpay subscription lifecycle events |

### tRPC Procedures

All tRPC routes are available at `/trpc` (native tRPC) and `/api` (OpenAPI REST).

#### `health`
| Procedure | Auth | Description |
|---|---|---|
| `health.getHealth` | Public | Server health status |

#### `form`
| Procedure | Auth | Description |
|---|---|---|
| `form.list` | Protected | List user's forms with analytics counts |
| `form.getById` | Protected | Get form by ID |
| `form.getByIdWithFields` | Protected | Get form with all fields |
| `form.getBySlug` | Public | Get public form by slug |
| `form.create` | Scoped | Create new form (enforces plan limits) |
| `form.update` | Scoped | Update form details |
| `form.delete` | Scoped | Soft-delete form |
| `form.publish` | Scoped | Publish draft form |
| `form.unpublish` | Scoped | Unpublish published form |
| `form.archive` | Scoped | Archive form |
| `form.clone` | Scoped | Deep-copy form with all fields |
| `form.duplicateForm` | Scoped | Alias for clone |
| `form.exportForm` | Scoped | Export form definition as JSON |

#### `formField`
| Procedure | Auth | Description |
|---|---|---|
| `formField.getFields` | Authenticated | Get all fields for a form |
| `formField.createField` | Authenticated | Add field to form |
| `formField.updateField` | Authenticated | Update field properties |
| `formField.deleteField` | Authenticated | Remove field (reindexes remaining) |
| `formField.duplicateField` | Authenticated | Clone a field |
| `formField.reorderFields` | Authenticated | Reorder fields (optimistic sync) |

#### `formSubmission`
| Procedure | Auth | Description |
|---|---|---|
| `formSubmission.createSubmission` | Public | Submit form response |
| `formSubmission.getSubmissionsByFormId` | Authenticated | Paginated submissions list |
| `formSubmission.getSubmissionById` | Authenticated | Single submission detail |
| `formSubmission.deleteSubmission` | Authenticated | Delete a submission |
| `formSubmission.exportSubmissions` | Authenticated | Export all submissions as CSV |
| `formSubmission.getAnalytics` | Authenticated | Analytics data for a form |
| `formSubmission.trackEvent` | Public | Track analytics event (view/start) |

#### `webhook`
| Procedure | Auth | Description |
|---|---|---|
| `webhook.listWebhooks` | Authenticated | List form webhooks |
| `webhook.createWebhook` | Authenticated | Create webhook endpoint |
| `webhook.updateWebhook` | Authenticated | Update webhook config |
| `webhook.deleteWebhook` | Authenticated | Delete webhook |

#### `formTemplate`
| Procedure | Auth | Description |
|---|---|---|
| `formTemplate.listTemplates` | Authenticated | List user's templates |
| `formTemplate.createTemplate` | Authenticated | Save form as template |
| `formTemplate.deleteTemplate` | Authenticated | Delete a template |
| `formTemplate.createFormFromTemplate` | Authenticated | Create new form from template |

#### `folder`
| Procedure | Auth | Description |
|---|---|---|
| `folder.listFolders` | Authenticated | List user's folders |
| `folder.createFolder` | Authenticated | Create new folder |
| `folder.updateFolder` | Authenticated | Rename folder |
| `folder.deleteFolder` | Authenticated | Delete folder (nullifies form.folderId) |
| `folder.moveFormToFolder` | Authenticated | Move form to folder |

#### `user`
| Procedure | Auth | Description |
|---|---|---|
| `user.getUserPlan` | Authenticated | Get user plan with form count and limit |
| `user.updateUserPlan` | Authenticated | Update user plan (admin) |

#### `payment`
| Procedure | Auth | Description |
|---|---|---|
| `payment.createSubscription` | Authenticated | Create Razorpay subscription |
| `payment.verifyPayment` | Authenticated | Verify payment after checkout |
| `payment.getSubscriptionStatus` | Authenticated | Get current subscription status |

#### `emailSettings`
| Procedure | Auth | Description |
|---|---|---|
| `emailSettings.get` | Authenticated | Get form email notification settings |
| `emailSettings.update` | Authenticated | Update email notification settings |

---

## Database Schema

| Table | Description |
|---|---|
| `users` | User accounts with role, plan, subscription info |
| `session` | better-auth sessions |
| `account` | better-auth accounts (OAuth + password) |
| `verification` | better-auth verification tokens |
| `forms` | Form definitions with status, visibility, settings, slug |
| `form_fields` | Form fields with type, options, validation, conditional logic |
| `form_submissions` | Submission responses (JSON values) |
| `form_analytics_events` | View/start/submit analytics events |
| `webhooks` | Webhook endpoint configurations |
| `form_templates` | Reusable form templates |
| `folders` | Form organization folders |
| `email_notification_settings` | Per-form email notification configuration |

### Field Types
```
TEXT | EMAIL | NUMBER | YES_NO | PASSWORD | SELECT | MULTI_SELECT | DATE | TIME
| RATING | TAGS | TOGGLE | RADIO | CHECKBOX | TEXTAREA | FILE_UPLOAD
```

### Form Statuses
`draft` → `published` → `archived`

### Form Visibilities
`public` | `unlisted` | `private`

---

## Installation

### Prerequisites
- **Node.js** >= 18
- **pnpm** 9.x (`npm install -g pnpm@9`)
- **Docker** (for local PostgreSQL)
- **PostgreSQL** 16+ (or Docker)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd form-builder
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Set Up Environment Variables
```bash
cp .env.example .env
```
Then edit `.env` with your credentials (see [Environment Variables](#environment-variables)).

### Step 4: Start PostgreSQL
```bash
pnpm run db:up
```
This starts a PostgreSQL 16 container on port 5432 (user: `postgres`, password: `postgres`, database: `dev`).

### Step 5: Generate & Run Migrations
```bash
pnpm run db:generate
pnpm run db:migrate
```

### Step 6: Start Development Servers
```bash
pnpm run dev
```
This starts:
- **API server** at http://localhost:8000
- **Web app** at http://localhost:3000

### Step 7 (Optional): Open Database Studio
```bash
pnpm run db:studio
```
Opens Drizzle Kit Studio for database management.

### Running in Production
```bash
pnpm run build
pnpm run start
```

---

## Environment Variables

| Variable | Package | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | database | Yes | — | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | trpc/services | No | — | better-auth encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | trpc/services | No | `http://localhost:8000` | Auth base URL |
| `NODE_ENV` | all | No | `development` | Runtime environment |
| `PORT` | api | No | `8000` | API listen port |
| `BASE_URL` | api | No | `http://localhost:8000` | API base URL |
| `WEB_URL` | api/trpc | No | `http://localhost:3000` | Frontend URL (CORS origin) |
| `ALLOWED_HOSTS` | api | No | `localhost:8000,localhost:3000` | Comma-separated allowed hosts |
| `COOKIE_SECRET` | api | No | — | Cookie signing secret (min 32 chars) |
| `TOKEN_ENCRYPTION_KEY` | api | No | — | Token encryption key (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | api | Yes | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | api | Yes | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | api | Yes | — | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | trpc | Yes | — | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | trpc | Yes | — | Razorpay key secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | web | No | — | Public Razorpay key (exposed to browser) |
| `RAZORPAY_WEBHOOK_SECRET` | api | No | — | Webhook HMAC signing secret |
| `GOOGLE_CLIENT_ID` | services | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | services | No | — | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | services | No | — | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | services | No | — | GitHub OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | web | No | — | Google client ID exposed to browser |
| `SMTP_HOST` | services | No | — | SMTP server host |
| `SMTP_PORT` | services | No | — | SMTP server port |
| `SMTP_USER` | services | No | — | SMTP username |
| `SMTP_PASS` | services | No | — | SMTP password |
| `FROM_EMAIL` | services | No | `noreply@formforge.app` | Sender email address |
| `LOGGER_LEVEL` | logger | No | `debug`/`error` | Winston log level |

---

## Project Structure

```
form-builder/
├── package.json                 # Root: scripts delegate to turbo run
├── turbo.json                   # Task pipeline definitions
├── pnpm-workspace.yaml          # Workspace definition
├── docker-compose.yml           # PostgreSQL 16 container
├── .env / .env.example          # Environment variables
├── setup.sh                     # One-shot setup script
│
├── apps/
│   ├── api/                     # Express API server (port 8000)
│   │   └── src/
│   │       ├── index.ts         # HTTP server entry
│   │       ├── server.ts        # Express app (middleware, routes, tRPC)
│   │       ├── upload.ts        # Multer + Cloudinary upload
│   │       └── env.ts           # Zod-validated env vars
│   │
│   └── web/                     # Next.js App Router (port 3000)
│       ├── app/                 # Pages & layouts
│       │   ├── layout.tsx       # Root layout (fonts, providers)
│       │   ├── (marketing)/     # Landing page
│       │   ├── (auth)/          # Sign in, sign up, password reset
│       │   ├── dashboard/       # Dashboard (forms, editor, analytics)
│       │   └── form/            # Public form view
│       ├── components/
│       │   ├── ui/              # 52 shadcn/ui primitives
│       │   ├── chrome/          # Layout (sidebar, shell, auth guard)
│       │   ├── form-builder/    # Editor (canvas, palette, inspector)
│       │   └── landing/         # Marketing page components
│       ├── hooks/api/           # 20+ tRPC React Query hooks
│       ├── lib/stores/          # Zustand stores (user, form editor)
│       ├── providers/           # tRPC, theme, query providers
│       ├── trpc/                # tRPC client setup
│       └── public/              # Static assets
│
└── packages/
    ├── database/                # Drizzle ORM schema, models, migrations
    │   ├── models/              # 10 table definitions
    │   ├── schemas/             # Zod validation schemas
    │   └── constants/           # Plan limits, field types
    ├── services/                # Business logic
    │   ├── auth/                # better-auth configuration
    │   ├── form/                # Form CRUD, publish, clone
    │   ├── form-field/          # Field CRUD, reorder, duplicate
    │   ├── form-submission/     # Submit, list, analytics, export
    │   ├── webhook/             # Webhook CRUD, trigger
    │   ├── form-template/       # Template CRUD
    │   ├── folder/              # Folder CRUD, move forms
    │   ├── slug/                # Slug generation & validation
    │   ├── email/               # Nodemailer + templates
    │   ├── email-settings/      # Per-form email config
    │   ├── user/                # User plan management
    │   ├── encryption/          # Token encryption utils
    │   └── rate-limiter/        # In-memory sliding window
    ├── trpc/                    # tRPC routers (10 routers, 42 procedures)
    │   ├── server/              # Server router + context
    │   └── client/              # Client types + exports
    ├── logger/                  # Winston logger
    ├── eslint-config/           # Shared ESLint config
    └── typescript-config/       # Shared tsconfig files
```

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Start all apps in development mode |
| `pnpm run build` | Build all apps and packages |
| `pnpm run lint` | Run ESLint across the monorepo |
| `pnpm run check-types` | Run TypeScript type checking |
| `pnpm run format` | Format code with Prettier |
| `pnpm run db:up` | Start PostgreSQL via Docker |
| `pnpm run db:generate` | Generate Drizzle migrations |
| `pnpm run db:migrate` | Apply migrations to database |
| `pnpm run db:studio` | Open Drizzle Kit Studio |

---

## Security

- **Rate limiting:** Global (200 req/15min), Auth (20 req/min), Payment (10 req/min), plus per-IP sliding window
- **CSRF protection:** csurf middleware on all state-changing requests
- **Security headers:** Helmet (CSP, HSTS, XSS filter, frameguard, no sniff)
- **Webhook verification:** HMAC-SHA256 timing-safe comparison
- **Password hashing:** bcrypt for form passwords and user credentials
- **File upload validation:** MIME type whitelist, 10MB limit, memory storage only
- **CORS:** Restricted to configured `WEB_URL` origin
- **Cookie security:** HTTP-only, secure in production, same-site lax
- **tRPC error handling:** Internal errors remapped (NOT_FOUND, FORBIDDEN) — no stack leaks
- **Session auth:** HTTP-only cookies with better-auth

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request.

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `docs:` — Documentation
- `chore:` — Maintenance

---

## License

This project is licensed under the MIT License.

---

<p align="center">Built using Turborepo, Next.js, Express, and TypeScript</p>
