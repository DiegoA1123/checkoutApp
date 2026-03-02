# 🚀 Checkout App

Aplicación de checkout full-stack con:

* **Backend:** NestJS + Prisma + PostgreSQL
* **Frontend:** Vue 3 + Vite
* **Base de Datos:** PostgreSQL (Docker)
* **Integración de pagos:** Wompi
* **Infraestructura local:** Docker Compose

## Infraestructura con Docker

El proyecto usa Docker para levantar:
* PostgreSQL
* pgAdmin
* API (NestJS)
* Web (Vue + Nginx)

## Requisitos

* Docker Desktop instalado y corriendo
* Node 20+ (solo si vas a ejecutar local sin Docker)

## Variables de Entorno

###  infra/.env
```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=checkout
POSTGRES_PORT=5432

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

PAYMENT_BASE_URL=https://sandbox.wompi.co/v1
PAYMENT_PUBLIC_KEY=
PAYMENT_PRIVATE_KEY=
PAYMENT_INTEGRITY_KEY=
PAYMENT_EVENTS_SECRET=

BASE_FEE_CENTS=500
DEFAULT_DELIVERY_FEE_CENTS=1500

VITE_API_BASE_URL=http://localhost:3001
```

## Levantar Todo el Proyecto

Desde la raíz:
```bash
cd infra
docker compose up --build
```

**Servicios disponibles:**

| Servicio | URL |
| :--- | :--- |
| API | http://localhost:3001 |
| Web | http://localhost:5173 |
| pgAdmin | http://localhost:5050 |
| Postgres | localhost:5432 |

## 🗄 Base de Datos (Docker)

La API ejecuta automáticamente:
* `prisma migrate deploy`
* `seed` (si `RUN_SEED=true`)

Si quieres que haga seed automático, agrega en `docker-compose.yml` dentro del servicio api:
```yaml
environment:
  RUN_SEED: "true"
```

## 🌱 Seed Manual (modo local sin Docker)
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

## API

**Base URL:** `http://localhost:3001`

### Productos
* **Listar productos:** `GET /products`
* **Obtener producto:** `GET /products/:id`

### Transacciones

#### Crear transacción pendiente
`POST /transactions`

**Body:**
```json
{
  "productId": "ID_DEL_PRODUCTO",
  "customer": {
    "fullName": "Juan Perez",
    "email": "juan@example.com",
    "phone": "3001234567"
  },
  "delivery": {
    "address": "Calle 123 #45-67",
    "city": "Medellin",
    "notes": "Apto 101"
  }
}
```

**Response:**
```json
{
  "transactionId": "cmm8gqvzp00059cepq95kj546",
  "reference": "REF-123",
  "status": "PENDING",
  "breakdown": {
    "productAmount": 10000,
    "baseFee": 500,
    "deliveryFee": 1500,
    "totalAmount": 12000
  }
}
```

#### 2️⃣ Pagar transacción
`POST /transactions/:id/pay`

**Body:**
```json
{
  "cardToken": "tok_xxxxxxxxx",
  "customerEmail": "juan@example.com"
}
```
*El token se genera desde el frontend usando Wompi JS SDK.*

**Response:**
```json
{
  "status": "APPROVED"
}
```
**Posibles estados:**
* PENDING
* APPROVED
* DECLINED
* ERROR

#### Consultar estado
`GET /transactions/:id`

#### Sincronizar estado con Wompi
`POST /transactions/:id/sync`

## Pruebas
**Ejecutar e2e:**
```bash
cd apps/api
npm run test:e2e
```
**Los tests:**
* Crean transacción
* Mockean gateway
* Ejecutan pago
* Verifican actualización de estado
* **Base de datos usada en test:** `checkout_test`

## 📌 Notas Importantes
* El seed solo corre si `RUN_SEED=true`
* El gateway está mockeado en e2e
* La API corre en el puerto 3001 (no 3000)
* El frontend usa `VITE_API_BASE_URL`
