const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const tareasRoutes = require('./routes/tareas.routes');
const actividadRoutes = require('./routes/actividad.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// CORS_ORIGIN acepta uno o varios orígenes separados por coma (útil para
// permitir a la vez el dev local y el dominio de producción del frontend).
const origenesPermitidos = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origenesPermitidos.includes('*') ? '*' : origenesPermitidos
  })
);
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true, servicio: 'taskflow-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/actividad', actividadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
