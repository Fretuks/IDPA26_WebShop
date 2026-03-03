# Postman Beispiel-Requests

## 1) Register

`POST /api/auth/register`

```json
{
  "firstname": "Max",
  "lastname": "Muster",
  "email": "max@example.com",
  "password": "SecurePass123"
}
```

## 2) Login

`POST /api/auth/login`

```json
{
  "email": "admin@webshop.local",
  "password": "Admin1234!"
}
```

## 3) Kategorie erstellen (ADMIN)

`POST /api/categories`

Header: `Authorization: Bearer <JWT>`

```json
{
  "name": "Gaming",
  "description": "Alles rund ums Gaming"
}
```

## 4) Produkt erstellen (ADMIN)

`POST /api/products`

Header: `Authorization: Bearer <JWT>`

```json
{
  "name": "Gaming Maus",
  "description": "RGB, kabelgebunden",
  "price": 79.90,
  "stock": 40,
  "categoryId": 1,
  "active": true
}
```

## 5) Produkt in Warenkorb legen

`POST /api/cart/items`

Header: `Authorization: Bearer <JWT>`

```json
{
  "productId": 1,
  "quantity": 2
}
```

## 6) Checkout

`POST /api/orders/checkout`

Header: `Authorization: Bearer <JWT>`

```json
{
  "paymentMethod": "PAYPAL",
  "addressId": 1
}
```

## 7) Adresse anlegen

`POST /api/users/me/addresses`

Header: `Authorization: Bearer <JWT>`

```json
{
  "street": "Bahnhofstrasse",
  "houseNumber": "12a",
  "zip": "8001",
  "city": "Zürich",
  "country": "CH"
}
```

## 8) Standard-Lieferadresse setzen

`PATCH /api/users/me/default-shipping/1`

Header: `Authorization: Bearer <JWT>`
