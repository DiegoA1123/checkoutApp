# Checkout App

Aplicación de checkout con integración de base de datos Postgres y pgAdmin.

## Infraestructura

El proyecto utiliza Docker para gestionar la base de datos y la herramienta de administración pgAdmin.

### Requisitos Previos

- Docker y Docker Desktop instalados y corriendo.

## Configuración de Base de Datos

### 1. Configurar Variables de Entorno

**Antes de iniciar**, es obligatorio configurar los archivos `.env`. Los datos que uses aquí serán los que necesites para conectar pgAdmin y la API.

**infra/.env**:

```dotenv
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
PGADMIN_DEFAULT_EMAIL=
PGADMIN_DEFAULT_PASSWORD=
```

**apps/api/.env**:

```dotenv
DATABASE_URL=
```

### Iniciar Servicios

Para levantar la base de datos y pgAdmin, ejecuta desde la raíz:

```bash
cd infra
docker-compose up -d
```

Los servicios estarán disponibles en:

- **Postgres**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050`

### 2. Conexión en pgAdmin

Para administrar la base de datos visualmente, los datos deben **coincidir exactamente** con lo configurado en tu `.env`:

1. Accede a [http://localhost:5050](http://localhost:5050).
2. Login (usa `PGADMIN_DEFAULT_EMAIL` y `PGADMIN_DEFAULT_PASSWORD` de tu `.env`):
   - **Email**:
   - **Password**:
3. Registra un nuevo servidor (**Servers > Register > Server**):
   - **Name**:
   - **Connection > Host**:host.docker.internal
   - **Connection > Port**:
   - **Connection > Maintenance database**:
   - **Connection > Username**:
   - **Connection > Password**:

## Base de Datos: Migraciones y Seed

Una vez que la infraestructura esté corriendo y los archivos `.env` configurados, sigue estos pasos para preparar la base de datos:

### 1. Generar Cliente y Tipos

```bash
cd apps/api
npx prisma generate
```

### 2. Ejecutar Migraciones

Crea las tablas en la base de datos basándote en el esquema:

```bash
npx prisma migrate dev --name init
```

### 3. Poblar Datos (Seed)

Para insertar los productos iniciales de prueba:

```bash
npx prisma db seed
```

## API y Pruebas (Postman)

La API corre por defecto en `http://localhost:3000`. También puedes acceder a la documentación interactiva en:

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)

### Endpoints Principales

#### 1. Productos

- **Listar productos**: `GET /products`
- **Obtener producto**: `GET /products/:id`

#### 2. Transacciones

- **Crear Transacción Pendiente**: `POST /transactions`
  - **Body (JSON)**:

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
        "city": "Bogotá",
        "notes": "Torre 1 Apt 101"
      }
    }
    ```

- **Pagar Transacción**: `POST /transactions/:id/pay`
  - **Body (JSON)**:

    ```json
    {
      "card": {
        "number": "4242424242424242",
        "expMonth": "12",
        "expYear": "25",
        "cvc": "123",
        "holder": "JUAN PEREZ"
      }
    }
    ```

- **Consultar Estado**: `GET /transactions/:id`
