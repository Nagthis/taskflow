const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const tareasRoutes = require('./routes/tareas.routes');
const actividadRoutes = require('./routes/actividad.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true, servicio: 'taskflow-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/actividad', actividadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
