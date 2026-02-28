# Checkout App

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
   - **Connection > Host**:
   - **Connection > Port**:
   - **Connection > Maintenance database**:
   - **Connection > Username**:
   - **Connection > Password**:

## Migraciones con Prisma

Para aplicar cambios en el esquema de la base de datos:

1. Ve a la carpeta de la API:

   ```bash
   cd apps/api
   ```

2. Ejecuta la migración:

   ```bash
   npx prisma migrate dev --name init
   ```
