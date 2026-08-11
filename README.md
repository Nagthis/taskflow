# TaskFlow

Proyecto de título (Instituto IACC) — gestión de tareas para un equipo
administrativo, con panel de supervisor. Basado en un diseño mockeado con
Claude Design y un modelo de datos relacional en PostgreSQL.

## Estructura

- **`backend/`** — API REST en Node.js + Express + PostgreSQL (JWT para auth).
- **`frontend/`** — SPA en React + Vite, recreando el diseño del prototipo.
- **`backend/sql/taskflow_schema.sql`** — modelo físico de datos (roles,
  usuarios, tareas, historial_tareas + vista `v_tareas_detalle`).

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Puesta en marcha

### 1. Base de datos

```bash
sudo -u postgres psql -c "CREATE ROLE taskflow WITH LOGIN PASSWORD 'taskflow_dev_pw';"
sudo -u postgres psql -c "CREATE DATABASE taskflow OWNER taskflow;"
PGPASSWORD=taskflow_dev_pw psql -h localhost -U taskflow -d taskflow -f backend/sql/taskflow_schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # ajusta credenciales si es necesario
npm install
npm run seed            # carga usuarios y tareas de demostración
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Login de demostración

`jose.luis@taskflow.cl` / `taskflow123`

## API

| Método | Ruta                        | Descripción                              |
|--------|-----------------------------|-------------------------------------------|
| POST   | `/api/auth/login`           | Login, devuelve JWT + perfil              |
| GET    | `/api/auth/me`               | Perfil del usuario autenticado            |
| GET    | `/api/usuarios`              | Lista de usuarios activos                 |
| GET    | `/api/tareas`                | Lista de tareas                           |
| POST   | `/api/tareas`                 | Crea una tarea                            |
| PATCH  | `/api/tareas/:id`             | Edita título/descripción/prioridad/fecha  |
| PATCH  | `/api/tareas/:id/estado`      | Cambia el estado                          |
| PATCH  | `/api/tareas/:id/asignado`    | Reasigna la tarea a otro usuario          |
| GET    | `/api/actividad`               | Historial reciente (para "Actividad")     |

Todas las rutas salvo `/api/auth/login` requieren `Authorization: Bearer <token>`.
Cada cambio de estado, edición y reasignación queda registrado en
`historial_tareas` para trazabilidad.
