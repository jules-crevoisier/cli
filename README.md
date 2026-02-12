# LetsCraft

CLI moderne de scaffolding pour projets web. Genere un projet complet et pret a coder en quelques secondes : stack au choix, Docker, bases de donnees, ORM, et modules pre-configures (auth, CRUD, admin, etc.).

```bash
npx letscraft mon-projet
```

---

## Table des matieres

- [Installation](#installation)
- [Demarrage rapide](#demarrage-rapide)
- [Stacks supportees](#stacks-supportees)
- [Bases de donnees](#bases-de-donnees)
- [ORM](#orm)
- [Services Docker](#services-docker)
- [Systeme de modules](#systeme-de-modules)
- [CLI — Options et commandes](#cli--options-et-commandes)
- [Mode non-interactif](#mode-non-interactif)
- [Fichiers generes](#fichiers-generes)
- [Architecture du projet](#architecture-du-projet)
- [Developpement](#developpement)
- [Tests](#tests)
- [Licence](#licence)

---

## Installation

```bash
npm install -g letscraft
```

Necessite **Node.js >= 20**.

## Demarrage rapide

```bash
# Mode interactif — le CLI vous guide etape par etape
letscraft

# Ou avec un nom de projet
letscraft mon-app

# Mode rapide — tout par defaut
letscraft mon-api --stack express --db postgresql --orm prisma --modules auth,crud -y
```

Le CLI genere un projet complet avec :
- Configuration TypeScript
- Docker Compose (bases de donnees + services)
- Dockerfile de production
- ESLint 9 + Prettier
- `.env` / `.env.example` pre-remplis
- `README.md` documente
- `agent.md` pour les assistants IA (Claude, Cursor, Copilot, etc.)

---

## Stacks supportees

### JavaScript / TypeScript (app locale, Docker pour les BDD)

| Stack | Framework | Version | Description |
|-------|-----------|---------|-------------|
| `nextjs` | Next.js | 15.1 | Full-stack React avec SSR, App Router, API routes |
| `nuxt` | Nuxt | 3.15 | Full-stack Vue avec SSR, API routes, file-based routing |
| `vite-react` | Vite + React | 6 + 19 | SPA client rapide avec HMR |
| `vite-react-express` | Vite + React + Express | 6 + 19 + 5 | Monorepo full-stack (client React + API Express) |
| `express` | Express.js | 5 | API REST backend avec Vitest |

### PHP (app + BDD dans Docker)

| Stack | Framework | Version | Description |
|-------|-----------|---------|-------------|
| `symfony` | Symfony | 7.2 | Full-stack PHP avec Doctrine, Caddy |
| `laravel` | Laravel | 11 | Full-stack PHP avec Eloquent, Nginx |

**Difference cle :**
- **JS stacks** : l'app tourne en local (`npm run dev`), seules les BDD sont dans Docker
- **PHP stacks** : tout tourne dans Docker (`docker compose up --watch`)

---

## Bases de donnees

Selectionnez une ou plusieurs bases de donnees. Chacune genere automatiquement un service Docker et les variables d'environnement correspondantes.

| Base de donnees | Version Docker | Port | Variable |
|-----------------|---------------|------|----------|
| PostgreSQL | 17 | 5432 | `DATABASE_URL` |
| MongoDB | 8 | 27017 | `MONGODB_URI` |
| MySQL | 9 | 3306 | `MYSQL_HOST`, `MYSQL_DATABASE` |
| Redis | 7.4 | 6379 | `REDIS_URL` |
| SQLite | — | — | `SQLITE_PATH` (fichier local) |

---

## ORM

| ORM | Stacks | Auto-selectionne ? |
|-----|--------|-------------------|
| **Prisma** | Next.js, Nuxt, Vite-React, Vite-React-Express, Express | Non (optionnel si BDD SQL) |
| **Doctrine** | Symfony | Oui (automatique) |
| **Eloquent** | Laravel | Oui (automatique) |

Quand Prisma est selectionne, le CLI genere :
- `prisma/schema.prisma` avec les modeles (User, Item si CRUD)
- `prisma/seed.ts` pour le seeding
- Scripts npm : `db:migrate`, `db:seed`, `db:studio`

---

## Services Docker

Services additionnels disponibles, chacun avec son propre conteneur Docker :

| Service | Description | Ports | Variables |
|---------|-------------|-------|-----------|
| **Mailpit** | Capture d'emails pour le dev | `1025` (SMTP), `8025` (Web UI) | `MAIL_HOST`, `MAIL_PORT` |
| **MinIO** | Stockage S3-compatible | `9000` (API), `9001` (Console) | `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` |
| **RabbitMQ** | File de messages | `5672` (AMQP), `15672` (Management) | `RABBITMQ_URL` |
| **Adminer** | Admin BDD via navigateur | `8080` | — |

> Adminer n'est propose que si une base SQL (PostgreSQL, MySQL, SQLite) est selectionnee.

---

## Systeme de modules

Les modules ajoutent des fonctionnalites pre-configurees a votre projet. Chaque module genere les fichiers specifiques a votre stack (routes, pages, composants, config).

### Modules disponibles

| Module | Description | Stacks |
|--------|-------------|--------|
| **auth** | Authentification (login, register, logout, middleware) | Toutes |
| **crud** | API CRUD complete avec modele Item | Express, Next.js, Nuxt, Vite-React-Express, Symfony, Laravel |
| **admin** | Dashboard admin (sidebar, stats, gestion users) | Next.js, React, Nuxt, Vite-React-Express, Symfony, Laravel |
| **file-upload** | Upload de fichiers vers S3/MinIO | Express, Next.js, Nuxt, Vite-React-Express, Symfony, Laravel |
| **email** | Emails transactionnels avec templates | Express, Next.js, Nuxt, Vite-React-Express, Symfony, Laravel |
| **api-docs** | Documentation Swagger/OpenAPI | Express, Next.js, Nuxt, Vite-React-Express, Symfony, Laravel |
| **i18n** | Internationalisation (EN + FR) | Toutes |
| **dark-mode** | Theme clair/sombre avec toggle | Next.js, React, Nuxt, Vite-React-Express |
| **ci-cd** | Workflow GitHub Actions | Toutes |

### Resolution automatique des dependances

- **admin** selectionne → **auth** auto-ajoute
- **file-upload** selectionne → service **MinIO** auto-ajoute
- **email** selectionne → service **Mailpit** auto-ajoute

### Module auth — Detail

Deux strategies d'authentification au choix :

| Strategie | Fonctionnement | Cas d'usage |
|-----------|---------------|-------------|
| **JWT** (defaut) | Token stateless, header `Authorization: Bearer` | API, SPA, mobile |
| **Session** | Cookie serveur, `express-session` | SSR, apps traditionnelles |

**Fichiers generes (exemple Express) :**
- `src/routes/auth.ts` — Routes POST `/register`, `/login`, `/logout`, GET `/me`
- `src/middleware/auth.ts` — Middleware `requireAuth`, `requireAdmin`
- `src/lib/auth.ts` — Hashing bcrypt, signing JWT

**Variables d'environnement :**
- `JWT_SECRET` — Cle de signature des tokens
- `JWT_EXPIRES_IN` — Expiration (defaut : 7j)
- `SESSION_SECRET` — Cle de session (mode session uniquement)

### Module crud — Detail

Genere un CRUD complet pour un modele `Item` avec les endpoints :

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/items` | Liste tous les items |
| GET | `/api/items/:id` | Recupere un item |
| POST | `/api/items` | Cree un item |
| PUT | `/api/items/:id` | Met a jour un item |
| DELETE | `/api/items/:id` | Supprime un item |

Si Prisma est actif, le modele `Item` est ajoute au schema avec les champs `title`, `description`, `status`.

### Module admin — Detail

Dashboard d'administration protege (requiert `role: "admin"` sur l'utilisateur).

- **Dashboard** — Cartes statistiques (nombre d'utilisateurs, items)
- **Users** — Table de gestion des utilisateurs
- **Sidebar** — Navigation laterale persistante

### Module dark-mode — Detail

Toggle de theme avec :
- Detection automatique de la preference systeme
- Persistance dans `localStorage`
- Classes Tailwind CSS `dark:` pour le theming
- Composants : `ThemeProvider` + `ThemeToggle`

---

## CLI — Options et commandes

### Commande principale : `letscraft [nom-projet]`

```
Options :
  -V, --version            Afficher la version
  --stack <type>           Stack : nextjs, nuxt, vite-react, vite-react-express, express, symfony, laravel
  --db <list>              Bases de donnees (separees par virgule) : postgresql, mongodb, mysql, redis, sqlite
  --orm <type>             ORM : prisma, none
  --services <list>        Services : mailpit, minio, rabbitmq, adminer
  --modules <list>         Modules : auth, crud, admin, file-upload, email, api-docs, i18n, dark-mode, ci-cd
  --auth-strategy <type>   Strategie auth : jwt, session
  --no-docker              Desactiver Docker
  --no-typescript          Desactiver TypeScript (stacks JS)
  --no-eslint              Desactiver ESLint + Prettier (stacks JS)
  --check-updates          Verifier les dernieres versions des frameworks
  -y, --yes                Accepter tous les defauts (mode non-interactif)
  -h, --help               Afficher l'aide

Commandes :
  help                     Afficher l'aide
  list                     Lister les projets crees avec letscraft
  update                   Mettre a jour letscraft
```

### Commande `help`

```bash
letscraft help
letscraft --help
letscraft -h
```

Affiche l'aide avec toutes les options et commandes disponibles.

### Commande `list`

```bash
letscraft list
```

Affiche tous les projets crees avec letscraft, leur stack, BDD, modules, et etat (existant/supprime).

### Commande `update`

```bash
letscraft update
```

Verifie et installe la derniere version depuis npm.

---

## Mode non-interactif

Parfait pour le CI/CD ou le scripting :

```bash
# API Express avec auth JWT + CRUD + PostgreSQL + Prisma
letscraft mon-api \
  --stack express \
  --db postgresql \
  --orm prisma \
  --modules auth,crud,api-docs \
  --auth-strategy jwt \
  -y

# App Next.js complete avec tous les modules
letscraft mon-app \
  --stack nextjs \
  --db postgresql \
  --orm prisma \
  --modules auth,crud,admin,dark-mode,i18n,ci-cd \
  --auth-strategy jwt \
  -y

# App Symfony avec email
letscraft mon-site \
  --stack symfony \
  --db postgresql \
  --services mailpit \
  --modules auth,crud,email \
  --auth-strategy jwt \
  -y

# App Nuxt full-stack
letscraft mon-app-nuxt --stack nuxt --db postgresql --orm prisma --modules auth,crud,dark-mode -y

# Monorepo React + Express
letscraft mon-fullstack --stack vite-react-express --db postgresql --orm prisma --modules auth,crud -y
```

Avec `-y`, les valeurs par defaut sont :
- TypeScript : active
- ESLint + Prettier : active
- Docker : active
- Modules : aucun (sauf si `--modules` specifie)

---

## Fichiers generes

Chaque projet genere contient :

| Fichier | Description |
|---------|-------------|
| `.env` / `.env.example` | Variables d'environnement (BDD, services, auth) |
| `.gitignore` | Ignore patterns adaptes a la stack |
| `.dockerignore` | Exclusions pour le build Docker |
| `docker-compose.yml` | Orchestration des services Docker |
| `Dockerfile` | Image de production multi-stage |
| `README.md` | Documentation du projet genere |
| `agent.md` | Instructions pour les IA (structure, conventions, commandes) |
| `eslint.config.js` | Config ESLint 9 flat (stacks JS) |
| `.prettierrc` | Config Prettier (stacks JS) |
| `prisma/schema.prisma` | Schema Prisma (si ORM Prisma) |

Plus tous les fichiers specifiques a la stack et aux modules selectionnes.

### agent.md

Fichier special genere pour les assistants IA. Contient :
- Vue d'ensemble du projet (stack, BDD, ORM, modules)
- Versions exactes de chaque technologie
- Arborescence du projet
- Commandes de dev/build/deploy
- Conventions d'architecture
- Documentation de chaque module actif
- Instructions specifiques pour le codage

---

## Architecture du projet

```
letscraft/
├── bin/
│   └── cli.js                    # Point d'entree executable
├── src/
│   ├── index.ts                  # Setup Commander.js + CLI
│   ├── types.ts                  # Types TypeScript
│   ├── prompts.ts                # Flow interactif (Inquirer)
│   ├── registry.ts               # Registre des projets crees
│   ├── update.ts                 # Auto-update npm
│   ├── generators/
│   │   ├── base.ts               # Pipeline de generation (8 etapes)
│   │   ├── nextjs.ts             # Generateur Next.js
│   │   ├── nuxt.ts               # Generateur Nuxt
│   │   ├── vite-react.ts         # Generateur Vite + React
│   │   ├── vite-react-express.ts # Generateur Vite + React + Express (composite)
│   │   ├── express.ts            # Generateur Express
│   │   ├── symfony.ts            # Generateur Symfony
│   │   └── laravel.ts            # Generateur Laravel
│   ├── modules/
│   │   ├── registry.ts           # Config des 9 modules (deps, stacks)
│   │   └── generator.ts          # Rendu des templates modules
│   ├── docker/
│   │   ├── compose.ts            # Generation docker-compose.yml
│   │   ├── dockerfile.ts         # Generation Dockerfile
│   │   ├── databases.ts          # Configs services BDD
│   │   └── services.ts           # Configs services additionnels
│   ├── ai/
│   │   └── generator.ts          # Generation agent.md
│   ├── utils/
│   │   ├── stacks.ts             # Helpers stack (hosts, ports)
│   │   ├── template.ts           # Rendu EJS
│   │   ├── logger.ts             # Formatage console
│   │   └── validation.ts         # Validation des inputs
│   ├── versions/
│   │   ├── defaults.json         # Versions par defaut
│   │   └── checker.ts            # Verification des versions
│   └── templates/                # 90+ templates EJS
│       ├── shared/               # Templates partages
│       ├── nextjs/               # Templates Next.js
│       ├── nuxt/                 # Templates Nuxt
│       ├── vite-react/           # Templates Vite + React
│       ├── vite-react-express/   # Templates Vite + React + Express
│       ├── express/              # Templates Express
│       ├── symfony/              # Templates Symfony
│       ├── laravel/              # Templates Laravel
│       └── modules/              # Templates modules (auth, crud, admin...)
│           ├── auth/             #   6 sous-dossiers par stack
│           ├── crud/             #   4 sous-dossiers
│           ├── admin/            #   5 sous-dossiers
│           ├── file-upload/      #   4 sous-dossiers
│           ├── email/            #   4 sous-dossiers
│           ├── api-docs/         #   4 sous-dossiers
│           ├── i18n/             #   6 sous-dossiers
│           ├── dark-mode/        #   3 sous-dossiers
│           └── ci-cd/            #   1 sous-dossier (shared)
├── tests/                        # 163 tests unitaires
├── scripts/
│   └── test-local.ts             # 12 tests E2E
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

### Pipeline de generation

Quand vous lancez `letscraft`, voici les 8 etapes executees :

1. **Creation du repertoire** projet
2. **Fichiers partages** — `.env`, `.gitignore`, `.dockerignore`, ESLint, Prettier
3. **Docker** — `docker-compose.yml` + `Dockerfile` (si BDD ou services)
4. **ORM** — Schema Prisma + seed (si Prisma selectionne)
5. **Fichiers stack** — Templates specifiques au framework choisi
6. **Fichiers modules** — Templates des modules selectionnes
7. **Documentation** — `README.md` + `agent.md`
8. **Registre** — Sauvegarde du projet dans `~/.letscraft/projects.json`

---

## Developpement

### Prerequisites

- Node.js >= 20
- npm

### Setup

```bash
git clone <repo>
cd cli
npm install
```

### Commandes

```bash
# Developpement avec watch mode
npm run dev

# Build
npm run build

# Type check
npm run typecheck

# Tests unitaires
npm test

# Tests unitaires (single run)
npm run test:run

# Tests E2E (genere des vrais projets + lance les serveurs)
npm run test:e2e

# Tester une stack specifique en E2E
npx tsx scripts/test-local.ts --stack express
```

### Ajouter un nouveau module

1. Ajouter le type dans `src/types.ts` (`ModuleType`)
2. Ajouter la config dans `src/modules/registry.ts` (stacks, deps, services)
3. Creer les templates dans `src/templates/modules/<nom>/<stack>/`
4. Ajouter le mapping dans `src/modules/generator.ts` (`getModuleTemplates()`)
5. Ajouter les deps dans les `package.json.ejs` / `composer.json.ejs` des stacks
6. Ajouter la doc dans `src/ai/generator.ts` (section agent.md)
7. Ecrire les tests dans `tests/`

### Ajouter une nouvelle stack

1. Ajouter le type dans `src/types.ts` (`StackType`)
2. Creer le generateur dans `src/generators/<stack>.ts` (implements `StackGenerator`)
3. L'enregistrer dans `src/generators/base.ts` (`getGenerator()`)
4. Creer les templates dans `src/templates/<stack>/`
5. Ajouter les versions dans `src/versions/defaults.json`
6. Mettre a jour `src/prompts.ts`, `src/docker/`, `src/ai/generator.ts`

---

## Tests

### Tests unitaires — 163 tests

```bash
npm run test:run
```

| Fichier | Tests | Description |
|---------|-------|-------------|
| `stacks.test.ts` | 24 | Utilitaires stack (hosts, ports) |
| `modules.test.ts` | 19 | Registre modules, deps, services |
| `docker-compose.test.ts` | 23 | Generation Docker Compose |
| `env-template.test.ts` | 13 | Templates .env |
| `eslint-config.test.ts` | 38 | Config ESLint |
| `readme.test.ts` | 46 | Generation README |

### Tests E2E — 12 scenarios

```bash
npm run test:e2e
```

Chaque test E2E :
1. Genere un vrai projet dans un dossier temporaire
2. Verifie que tous les fichiers requis existent
3. Execute `npm install` (stacks JS)
4. Lance le serveur de dev
5. Effectue un health check HTTP
6. Nettoie le dossier

**Scenarios couverts :**
- 7 stacks de base (Next.js, Nuxt, Vite-React, Vite-React-Express, Express, Symfony, Laravel)
- Next.js + Prisma
- Express + Mailpit (sans BDD)
- Laravel + Mailpit
- Express + modules (auth, crud, api-docs)
- Next.js + modules (auth, admin, dark-mode, i18n)
- Symfony + modules (auth, crud, email)

---

## Licence

MIT
