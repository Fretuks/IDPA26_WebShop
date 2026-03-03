# ERD (textuelle Beschreibung)

## Entitäten und Beziehungen

1. **users** (1) —— (1) **carts**
   - Jeder User besitzt genau einen Cart.

2. **carts** (1) —— (n) **cart_items**
   - Ein Warenkorb enthält mehrere Positionen.

3. **products** (1) —— (n) **cart_items**
   - Eine Warenkorbposition referenziert genau ein Produkt.

4. **users** (1) —— (n) **orders**
   - Ein User kann mehrere Bestellungen aufgeben.

5. **orders** (1) —— (n) **order_items**
   - Eine Bestellung enthält mehrere Positionen.

6. **products** (1) —— (n) **order_items**
   - Jede Bestellposition referenziert ein Produkt.

7. **categories** (1) —— (n) **products**
   - Jede Kategorie enthält mehrere Produkte.

8. **users** (1) —— (n) **addresses**
   - Ein User kann 0..n Adressen pflegen.

9. **users.default_shipping_address_id** (0..1) —— (1) **addresses.id**
   - Definiert optionale Standard-Lieferadresse.

10. **users.default_billing_address_id** (0..1) —— (1) **addresses.id**
    - Definiert optionale Standard-Rechnungsadresse.

11. **orders** enthält Address-Snapshots (`shipping_address_snapshot`, `billing_address_snapshot`)
    - Historische Bestellungen bleiben unverändert bei späteren Adressänderungen.

## Normalisierung (mind. 3NF)

- Keine wiederholenden Gruppen in Tabellen (1NF).
- Keine partiellen Abhängigkeiten von zusammengesetzten Schlüsseln (2NF).
- Keine transitiven Abhängigkeiten von Nicht-Schlüsselattributen (3NF).
- Referenzielle Integrität über Foreign Keys.
