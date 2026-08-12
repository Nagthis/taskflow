# Desplegar TaskFlow en internet (gratis)

> **Ya desplegado.** Frontend: https://taskflow-nu-lac.vercel.app · Backend:
> https://taskflow-z3ny.onrender.com · Código: https://github.com/Nagthis/taskflow
> Esta guía queda para referencia (p. ej. si hay que recrear el entorno).

Tres servicios, todos con plan gratuito y sin tarjeta de crédito para lo
que necesitamos:

| Servicio | Para qué | URL |
|----------|----------|-----|
| **Neon** | PostgreSQL en la nube | https://neon.tech |
| **Render** | Backend (Node/Express) | https://render.com |
| **Vercel** | Frontend (React/Vite) | https://vercel.com |

Los tres se conectan a tu repositorio de GitHub y despliegan solos cada
vez que haces `git push`. Este documento asume que ya corriste
`git init` (ya lo hicimos) — falta subirlo a GitHub.

---

## 0. Subir el repo a GitHub

1. Entra a https://github.com/new y crea un repositorio (público o
   privado, como prefieras). **No** marques "Add a README" (ya tenemos uno).
2. Copia la URL que te da GitHub (algo como
   `https://github.com/tu-usuario/taskflow.git`) y corre en tu terminal:

   ```bash
   cd ~/proyectos/taskflow
   git remote add origin https://github.com/tu-usuario/taskflow.git
   git push -u origin main
   ```

   Te va a pedir usuario/contraseña de GitHub — si no tienes un
   [personal access token](https://github.com/settings/tokens) generado,
   crea uno (scope `repo`) y úsalo como contraseña.

---

## 1. Base de datos: Neon

1. Crea una cuenta en https://neon.tech (puedes entrar con GitHub).
2. **New Project** → nómbralo `taskflow` → región cercana a Chile (ej.
   `us-east` si no hay una de Sudamérica) → **Create**.
3. Neon te muestra un **connection string** tipo:
   ```
   postgresql://neondb_owner:AbC123@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   Guárdalo, lo vas a necesitar dos veces (para cargar el schema y para el backend).
4. Carga el schema desde tu terminal (reemplaza `<CONNECTION_STRING>` por el de arriba):

   ```bash
   psql "<CONNECTION_STRING>" -f ~/proyectos/taskflow/backend/sql/taskflow_schema.sql
   ```
5. Carga los datos de demostración apuntando el seed a Neon en vez de tu Postgres local:

   ```bash
   cd ~/proyectos/taskflow/backend
   DATABASE_URL="<CONNECTION_STRING>" npm run seed
   ```

   Deberías ver el mismo mensaje de siempre: `5 usuarios, 15 tareas, 5 eventos de historial`.

---

## 2. Backend: Render

1. Crea una cuenta en https://render.com (con GitHub es más rápido).
2. **New** → **Web Service** → conecta tu repo `taskflow`.
3. Configuración:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. En **Environment Variables**, agrega:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | el connection string de Neon |
   | `JWT_SECRET` | cualquier texto largo y aleatorio (ej. genera uno con `openssl rand -hex 32`) |
   | `JWT_EXPIRES_IN` | `8h` |
   | `CORS_ORIGIN` | `*` por ahora (lo ajustamos en el paso 4) |
5. **Create Web Service**. Espera a que el build termine (unos 2-3 min) y
   copia la URL que te asigna, algo como `https://taskflow-backend.onrender.com`.
6. Prueba que responde: abre `https://taskflow-backend.onrender.com/api/salud`
   en el navegador — debería mostrar `{"ok":true,...}`.

   > **Nota**: el plan free de Render "duerme" el servicio tras 15 min sin
   > tráfico. La primera petición después de eso tarda ~30-50s en
   > despertar — normal, no es un error. Para una demo en vivo, abre la
   > URL un par de minutos antes.

---

## 3. Frontend: Vercel

1. Crea una cuenta en https://vercel.com (con GitHub).
2. **Add New** → **Project** → importa tu repo `taskflow`.
3. Configuración:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (debería detectarlo solo)
4. En **Environment Variables**, agrega:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://taskflow-backend.onrender.com/api` (la URL de Render del paso 2, con `/api` al final) |
5. **Deploy**. Al terminar te da una URL como `https://taskflow-tu-usuario.vercel.app`.

---

## 4. Cerrar el círculo: CORS

Ahora que tienes la URL final de Vercel, vuelve a Render:

1. **Environment** → edita `CORS_ORIGIN` → ponle exactamente tu URL de Vercel
   (sin `/` al final), ej. `https://taskflow-tu-usuario.vercel.app`.
2. Guarda — Render redespliega solo con el nuevo valor (unos 30s).

---

## 5. Probar

Abre tu URL de Vercel, entra con `jose.luis@taskflow.cl` / `taskflow123`
y prueba crear una tarea. Si el login falla con un error de red, dale
unos 30-50s (el backend de Render puede estar "despertando", ver nota
del paso 2) y reintenta.

---

## Actualizar después de cambios

Con todo conectado, el flujo normal es:

```bash
git add -A
git commit -m "lo que cambiaste"
git push
```

Render y Vercel detectan el push y redespliegan solos. No hace falta
tocar nada más — salvo que agregues una variable de entorno nueva, esa
sí hay que agregarla a mano en el dashboard de cada uno.
