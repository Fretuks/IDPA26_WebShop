# IDPA26 WebShop Dokumentation

Diese Dokumentation beschreibt den aktuellen technischen Stand des Projekts `IDPA26_WebShop`. Das Repository besteht aus einem React/Vite-Frontend, einem Express/PostgreSQL-Backend und dieser Dokumentationsablage.

## Projektstand

Der Webshop deckt aktuell die wichtigsten E-Commerce-Grundfunktionen ab:

- Produktuebersicht und Produktdetailseiten
- Kategorien fuer die Produktnavigation
- Registrierung und Login mit JWT-basierter Authentifizierung
- Persistenter Warenkorb ueber die Backend-API
- Checkout mit Liefer- und Rechnungsadresse
- Verwaltung des eigenen Profils und gespeicherter Adressen
- Bestellanlage mit mehreren Zahlungsarten
- Vorbereitete Admin-Endpunkte fuer Produkte, Kategorien und Bestellungen

## Repository-Struktur

```text
IDPA26_WebShop/
|-- backend/
|   |-- sql/
|   |-- src/
|   `-- README.md
|-- documentation/
|   `-- README.md
|-- frontend/
|   |-- dist/
|   `-- src/
`-- README.md
```

## Frontend

Das Frontend liegt in `frontend/` und basiert auf React 18, React Router und Vite.

Aktuelle Seiten:

- `/` Uebersichtsseite
- `/products` Produktliste
- `/products/:id` Produktdetail
- `/cart` Warenkorb
- `/checkout` Checkout
- `/login` Login
- `/register` Registrierung
- `/settings` Profil- und Adressverwaltung

Wichtige Frontend-Bausteine:

- `src/context/AuthContext.jsx` verwaltet Session, Benutzerrolle und Login/Register-Flow
- `src/context/CartContext.jsx` synchronisiert den Warenkorb mit der API
- `src/services/api.js` kapselt die gesamte Kommunikation mit dem Backend

## Backend

Das Backend liegt in `backend/` und verwendet Node.js, Express, PostgreSQL, JWT und bcrypt.

Aktive API-Bereiche:

- `/health` Health-Check
- `/api/auth` Registrierung und Login
- `/api/products` Produkte
- `/api/categories` Kategorien
- `/api/cart` Warenkorb
- `/api/orders` Checkout und Bestellungen
- `/api/admin` Admin-Funktionen
- `/api/users` Benutzerprofil und Adressen

Die Backend-Struktur trennt Controller, Services, Repositories, Middleware und Validatoren.

## Lokale Entwicklung

Voraussetzungen:

- Node.js 20 oder neuer
- PostgreSQL 14 oder neuer

Backend-Umgebungsvariablen in `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webshop_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=super-secret-change-me
JWT_EXPIRES_IN=12h
BCRYPT_ROUNDS=12
```

Frontend-Umgebungsvariablen in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Lokales Setup:

1. Abhaengigkeiten in `backend/` und `frontend/` installieren
2. PostgreSQL-Datenbank `webshop_db` erstellen
3. Datenbankschema aus `backend/sql/schema.sql` importieren
4. Optional Demo-Daten mit `npm run seed` im Backend laden

Startbefehle:

- Backend: `npm run dev`
- Frontend: `npm run dev`

Standard-URLs lokal:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Verfuegbare Skripte

Backend:

- `npm run dev`
- `npm start`
- `npm run seed`
- `npm run check`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`

## Hinweise zum Dokumentationsstand

Der Ordner `documentation/` enthaelt aktuell nur dieses README. Aeltere Verweise auf weitere Dateien wie `ERD.md` oder `postman_examples.md` entsprechen im aktuellen Repository-Stand nicht mehr dem tatsaechlich vorhandenen Inhalt.
