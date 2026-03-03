# IDPA Webshop Backend (Node.js + Express + PostgreSQL)

Dieses Backend implementiert den vollständigen Server-Teil des Webshops in einer **3-Schichten-Architektur**:

- **Controller-Layer** (`src/controllers`): HTTP / REST-Ein- und Ausgaben
- **Service-Layer** (`src/services`): Geschäftslogik
- **Repository-Layer** (`src/repositories`): Datenbankzugriffe
- **Model-Layer** (`src/models`): Domänen-Konstanten/Enums

## 1) Voraussetzungen

- Node.js 20+
- PostgreSQL 14+

## 2) Installation

```bash
cd backend
cp .env.example .env
npm install
```

## 3) Datenbank erstellen

1. Datenbank anlegen (Beispiel):

```sql
CREATE DATABASE webshop_db;
```

2. Schema importieren:

```bash
psql -U postgres -d webshop_db -f sql/schema.sql
```

3. Seed-Daten laden:

```bash
npm run seed
```

Seed erzeugt:
- 10 Kategorien
- 100 Produkte
- 1 Admin-User
- 1 Test-User

## 4) Start

```bash
npm run dev
```

oder

```bash
npm start
```

Health-Check:

```http
GET /health
```

## 5) REST API Endpunkte

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Produkte
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (ADMIN)
- `PUT /api/products/:id` (ADMIN)
- `DELETE /api/products/:id` (ADMIN)

### Kategorien
- `GET /api/categories`
- `POST /api/categories` (ADMIN)
- `PUT /api/categories/:id` (ADMIN)
- `DELETE /api/categories/:id` (ADMIN)

### Warenkorb
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

### Checkout / Bestellungen
- `POST /api/orders/checkout`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/admin/orders` (ADMIN)

### User-Adressen (auth required)
- `GET /api/users/me/addresses`
- `POST /api/users/me/addresses`
- `PUT /api/users/me/addresses/:id`
- `DELETE /api/users/me/addresses/:id`
- `PATCH /api/users/me/default-shipping/:addressId`
- `PATCH /api/users/me/default-billing/:addressId`

## 6) Sicherheit

- JWT Authentifizierung (Bearer Token)
- bcrypt Passwort-Hashing
- Rollenprüfung über Middleware (RBAC)
- Input-Validierung mit `express-validator`
- SQL-Injection-Schutz über parametrisierte Queries
- Zentrales Error-Handling mit HTTP-Statuscodes

## 7) Projektstruktur

```text
backend/
  sql/
    schema.sql
  src/
    config/
    controllers/
    middleware/
    models/
    repositories/
    routes/
    scripts/
    services/
    utils/
    validators/
    app.js
    server.js
  .env.example
  package.json
```

## 8) Beispiel-Zugangsdaten (Seed)

- Admin: `admin@webshop.local` / `Admin1234!`
- Testuser: `test@webshop.local` / `Test1234!`

## 9) Postman Beispiele

Siehe: `documentation/postman_examples.md`

## 10) ERD (textuell)

Siehe: `documentation/ERD.md`
