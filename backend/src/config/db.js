const { Pool } = require('pg');

// En producción (Render, Neon, etc.) se usa DATABASE_URL, una sola cadena
// de conexión que ya viene con SSL. En desarrollo local seguimos usando
// las variables PG* sueltas del .env, sin SSL (Postgres local no lo pide).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    });

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = pool;
